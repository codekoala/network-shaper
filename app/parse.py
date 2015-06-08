from pprint import pprint
import re
import subprocess


VALID_UNITS = (
    'bit',
    'kbit',
    'mbit',
    'gbit',
    'tbit',
    'bps',
    'kbps',
    'mbps',
    'gbps',
    'tbps',
)
UNITS = '|'.join(VALID_UNITS)


def pct_corr(keyword, varname=None):
    if varname is None:
        varname = keyword

    return re.compile((
        r'{keyword}\s+(?P<{varname}_pct>\d+(\.\d+)?)%'
        r'(\s+(?P<{varname}_corr>\d+(\.\d+)?)%)?'
    ).format(keyword=keyword, varname=varname))

# qdisc netem 8008: root refcnt 2 limit 1000 delay 200.0ms  50.0ms loss 50% 10% duplicate 40% 60% reorder 75% 50% corrupt 10% 50% rate 500Kbit gap 5
# qdisc netem 800c: root refcnt 2 limit 1000 delay 200.0ms  50.0ms loss 50% 10% duplicate 40% 60% reorder 75% 50% corrupt 10% 50% rate 500Kbit packetoverhead 10 cellsize 10 gap 10

LIMIT_RE = re.compile(r'limit\s+(?P<limit>\d+)')
DELAY_RE = re.compile(
    r'delay\s+(?P<delay>\d+(\.\d+)?)(?P<delay_unit>(?:m|u)s)'
    r'(\s+(?P<delay_jitter>\d+(\.\d+)?)(?P<delay_jitter_unit>(?:m|u)s)'
    r'(\s+(?P<delay_corr>\d+(\.\d+)?)%)?)?'
)
LOSS_RE = pct_corr('loss')
DUPE_RE = pct_corr('duplicate', 'dup')
REORDER_RE = pct_corr('reorder')
GAP_RE = re.compile(r'gap\s+(?P<reorder_gap>\d+)')
CORRUPT_RE = pct_corr('corrupt')
RATE_RE = re.compile((
    r'rate\s+(?P<rate>\d+(\.\d+)?)(?P<rate_unit>{units})'
    r'(\s+packetoverhead\s+(?P<rate_packet_overhead>\d+)'
    r'(\s+cellsize\s+(?P<rate_cell_size>\d+)'
    r'(\s+celloverhead\s+(?P<rate_cell_overhead>\d+))?)?)?'
).format(units=UNITS), re.I)


PARSERS = (
    LIMIT_RE,
    DELAY_RE,
    LOSS_RE,
    DUPE_RE,
    REORDER_RE, GAP_RE,
    CORRUPT_RE,
    RATE_RE,
)


rules = subprocess.check_output('tc qdisc show dev em1 | grep netem | head -1', shell=True).decode()

print('Found rules:', rules)

settings = {}
for parser in PARSERS:
    print(parser.pattern)
    m = parser.search(rules)
    if m:
        settings.update(m.groupdict())


pprint(settings)
