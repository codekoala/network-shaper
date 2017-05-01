#!/bin/sh

set -e

trap "chown -R ${TGT_UID}:${TGT_GID} /project/" EXIT

cmd="${@}"
if [ ! "$1" = 'sencha' ]; then
    cmd="sencha ${cmd}"
fi

chown -R sencha:sencha /project/
su -p sencha -c "/home/sencha/bin/Sencha/Cmd/6.1.3.42/${cmd}"
