(function (document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  app.displayInstalledToast = function() {
    document.querySelector('#caching-complete').show();
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    app.onRefresh();
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    document.querySelector('body').removeAttribute('unresolved');
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onMenuSelect = function() {
    var drawerPanel = document.querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };

  // Display a message for the user
  app.showToast = function(text) {
    var t = $('#toaster')[0];
    t.set('text', text);
    t.show();
  };

  // Reset all netem settings
  app.onReset = function() {
    $.post('/remove', function() {
      app.showToast('Settings reset successfully');
    });
  };

  // Reload all netem settings and populate the form
  app.onRefresh = function() {
    $.get('/refresh', app.restoreSettings);
  };

  // Populate the form with configuration values
  app.restoreSettings = function(allData) {
    var sliders = {
          delay: ['jitter', 'corr'],
          reorder: ['pct', 'corr', 'gap'],
          rate: ['pkt_overhead', 'cell_size', 'cell_overhead'],
          corrupt: ['pct', 'corr'],
          dupe: ['pct', 'corr'],
          loss: ['pct', 'corr']
        };

    _.each(['inbound', 'outbound'], function(dir) {
      var dirEl = $('section[data-route=' + dir + ']'),
          dev = $('paper-menu#' + dir + '-device')[0],
          data = allData[dir].netem;

      _.find(dev.items, function(item, i) {
        if (!_.isEqual(item.name, allData[dir].device)) {
          return false;
        }

        dev.select(i);
        return true;
      });

      _.each(sliders, function(sub, section) {
        _.each(sub, function(name) {
          var sName  = section + '_' + name,
              slider = dirEl.find('float-slider[name=' + sName + ']');

          if (!_.isEmpty(slider)) {
            slider[0].set('value', data[sName]);
          }
        });
      });

      dirEl.find('float-slider[name=delay_time]')[0].set('value', data.delay);
      dirEl.find('float-slider[name=rate_speed]')[0].set('value', data.rate);

      dirEl.find('paper-checkbox[name=chk-delay]')[0].set('checked', data.delay > 0);
      dirEl.find('paper-checkbox[name=chk-reorder]')[0].set('checked', data.reorder_pct > 0);
      dirEl.find('paper-checkbox[name=chk-rate]')[0].set('checked', data.rate > 0);
      dirEl.find('paper-checkbox[name=chk-corrupt]')[0].set('checked', data.corrupt_pct > 0);
      dirEl.find('paper-checkbox[name=chk-dupe]')[0].set('checked', data.dupe_pct > 0);
      dirEl.find('paper-checkbox[name=chk-loss]')[0].set('checked', data.loss_pct > 0);
    });

    app.showToast('Settings restored successfully');
  };

  // Apply the selected setting to the host
  app.onApply = function() {
    var sliders = {
      delay: ['time', 'jitter', 'corr'],
      reorder: ['pct', 'corr', 'gap'],
      rate: ['speed', 'pkt_overhead', 'cell_size', 'cell_overhead'],
      corrupt: ['pct', 'corr'],
      dupe: ['pct', 'corr'],
      loss: ['pct', 'corr']
    };

    var inDev = $('paper-menu#inbound-device')[0],
        outDev = $('paper-menu#outbound-device')[0],
        allowNoIP = $('paper-checkbox#allow-no-ip')[0].checked;

    if (!inDev.selectedItem) {
      app.showToast('Please select an inbound device');
      return;
    } else {
      inDev = inDev.selectedItem.name;
    }

    if (!outDev.selectedItem) {
      app.showToast('Please select an outbound device');
      return;
    } else {
      outDev = outDev.selectedItem.name;
    }

    var payload = {
      inbound: {
        delay_unit: 'ms',
        delay_jitter_unit: 'ms',
        rate_unit: 'kbit'
      },
      outbound: {
        delay_unit: 'ms',
        delay_jitter_unit: 'ms',
        rate_unit: 'kbit'
      }
    };

    _.each(['inbound', 'outbound'], function(dir) {
      var dirEl = $('section[data-route=' + dir + ']');

      _.each(sliders, function(sub, section) {
        if (!dirEl.find('paper-checkbox[name=chk-' + section + ']')[0].checked) {
          return;
        }

        _.each(sub, function(name) {
          var sName  = section + '_' + name,
              slider = dirEl.find('float-slider[name=' + sName + ']');

          if (!_.isEmpty(slider)) {
            payload[dir][sName] = slider[0].value;
          }
        });
      });

      var dist = $('paper-radio-group[name=distribution]');
      if (!_.isEmpty(dist)) {
        payload[dir].distribution = dist[0].selected;
      }

      payload[dir].delay = payload[dir].delay_time;
      delete payload[dir].delay_time;

      payload[dir].rate = payload[dir].rate_speed;
      delete payload[dir].rate_speed;
    });

    $.ajax({
      url: '/apply',
      dataType: 'json',
      contentType: 'application/json',
      method: 'POST',
      data: JSON.stringify({
        allow_no_ip: allowNoIP,
        inbound: {
          device: inDev,
          netem: payload.inbound
        },
        outbound: {
          device: outDev,
          netem: payload.outbound
        }
      }),
      success: function() {
        app.showToast('Settings applied successfully');
      },
      error: function(msg) {
        app.showToast(msg.responseText);
      }
    });

    return false;
  };
})(document);

// TODO: Decide if we still want to suggest wrapping as it requires
// using webcomponents.min.js.
// wrap document so it plays nice with other libraries
// http://www.polymer-project.org/platform/shadow-dom.html#wrappers
// )(wrap(document));
