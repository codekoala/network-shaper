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
  app.restoreSettings = function(data) {
    var payload = {},
        sliders = {
          delay: ['jitter', 'corr'],
          reorder: ['pct', 'corr', 'gap'],
          rate: ['pkt_overhead', 'cell_size', 'cell_overhead'],
          corrupt: ['pct', 'corr'],
          dupe: ['pct', 'corr'],
          loss: ['pct', 'corr']
        };

    _.each(['inbound', 'outbound'], function(dir) {
      dirEl = $('section[data-route=' + dir + ']')[0];

      _.each(sliders, function(sub, section) {
        _.each(sub, function(name) {
          var sName  = section + '_' + name,
              slider = dirEl.find('float-slider[name=' + sName + ']');

          if (!_.isEmpty(slider)) {
            slider[0].set('value', data[sName]);
          }
        });
      });
    });

    $('float-slider[name=delay_time]')[0].set('value', data.delay);
    $('float-slider[name=rate_speed]')[0].set('value', data.rate);

    $('paper-checkbox[name=chk-delay]')[0].set('checked', data.delay > 0);
    $('paper-checkbox[name=chk-reorder]')[0].set('checked', data.reorder_pct > 0);
    $('paper-checkbox[name=chk-rate]')[0].set('checked', data.rate > 0);
    $('paper-checkbox[name=chk-corrupt]')[0].set('checked', data.corrupt_pct > 0);
    $('paper-checkbox[name=chk-dupe]')[0].set('checked', data.dupe_pct > 0);
    $('paper-checkbox[name=chk-loss]')[0].set('checked', data.loss_pct > 0);

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

    var payload = {
      delay_unit: 'ms',
      delay_jitter_unit: 'ms',
      rate_unit: 'kbit'
    };

    _.each(sliders, function(sub, section) {
      if (!$('paper-checkbox[name=chk-' + section + ']')[0].checked) {
        return;
      }

      _.each(sub, function(name) {
        var sName  = section + '_' + name,
            slider = $('float-slider[name=' + sName + ']');

        if (!_.isEmpty(slider)) {
          payload[sName] = slider[0].value;
        }
      });
    });

    var dist = $('paper-radio-group[name=distribution]');
    if (!_.isEmpty(dist)) {
      payload.distribution = dist[0].selected;
    }

    payload.delay = payload.delay_time;
    delete payload.delay_time;

    payload.rate = payload.rate_speed;
    delete payload.rate_speed;

    $.ajax({
      url: '/apply',
      dataType: 'json',
      method: 'POST',
      data: JSON.stringify(payload),
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
