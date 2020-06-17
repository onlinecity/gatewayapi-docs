$(document).ready(function () {

  var sideNav = $('.sidewide-nav');
  var headerEl = $('div.header');

  var tokenTimer;
  var jwt, me;

  function initialize() {
    checkTokenAndUpdateProfile();
    moveAnchorTarget();
    initChatlio();
  }

  function isTokenValid() {
    if (!window.localStorage) return false;
    jwt = window.localStorage['lscache-extended_jwt'] ? $.parseJSON(window.localStorage['lscache-extended_jwt']) : {};
    me = window.localStorage['lscache-me'] ? $.parseJSON(window.localStorage['lscache-me']) : {};
    var unixTime = (Math.round((new Date()).getTime() / 1000));
    return me && me.name && jwt && parseInt(jwt.expires_at) > parseInt(unixTime);
  }

  function moveAnchorTarget() {
    // Modifying the Sphinx output seems too difficult, so move the ID tags
    // from the node carrying them to new offset anchor target
    $('a.headerlink').each(function () {
      var target = this.href.substr(this.href.indexOf('#') + 1);
      $('<a class="anchor" />').attr('id', target).insertAfter($(this));
      $(this).closest('[id]').removeAttr('id');
    });
    // Also fix inline links
    $('span[id]').each(function () {
      var target = $(this).attr('id')
      $('<a class="anchor" />').attr('id', target).insertAfter($(this));
      $(this).removeAttr('id');
    });
  }

  function initChatlio() {
    // Chatlio.com integration
    document.addEventListener('chatlio.ready', function () {
      window._chatlio.configure({
        'onlineTitle': 'How can we help you?',
        'offlineTitle': 'Contact Us',
        'agentLabel': 'OnlineCity GatewayAPI Support',
        'onlineMessagePlaceholder': 'Type message here...',
        'offlineGreeting': 'Sorry we are away, but we would love to hear from you and chat soon!',
        'offlineEmailPlaceholder': 'Email',
        'offlineMessagePlaceholder': 'Your message here',
        'offlineNamePlaceholder': 'Name (optional but helpful)',
        'offlineSendButton': 'Send',
        'offlineThankYouMessage': 'Thanks for your message. We will be in touch soon!',
        'autoResponseMessage': 'Question? Just type it below and we are online and ready to answer.'
      });
    });
    if (isTokenValid()) {
      me = window.localStorage['lscache-me'] ? $.parseJSON(window.localStorage['lscache-me']) : {};
      var userId;
      if (me.name && me.name.indexOf(' ') !== -1) {
        userId = me.name.substring(0, me.name.indexOf(' ') + 2).replace(/ /g, '').toLowerCase();
      } else if (me.email) {
        userId = me.email.substring(0, me.email.indexOf('@')).toLowerCase().replace(/[^a-z0-9]+/g, '');
      }
      window._chatlio.identify(userId, {
        'Name': me.name,
        'Email': me.email
      });
    }
  }

  function checkTokenAndUpdateProfile() {
    if (!isTokenValid()) {
      tokenTimer && clearInterval(tokenTimer);

      sideNav.find('li.dashboard').addClass('hidden');
      sideNav.find('li.profile').addClass('hidden');
      sideNav.find('li.login').removeClass('hidden');

      headerEl.find('li.dashboard').addClass('hidden');
      headerEl.find('li.login').removeClass('hidden');

      headerEl.find('.username-wrap').addClass('hidden');
      headerEl.find('.thumbnail-wrap').addClass('hidden');

    } else if (!tokenTimer) {

      sideNav.find('li.dashboard').removeClass('hidden');
      sideNav.find('li.profile').removeClass('hidden');
      sideNav.find('li.login').addClass('hidden');

      headerEl.find('li.dashboard').removeClass('hidden');
      headerEl.find('li.login').addClass('hidden');

      headerEl.find('.username-wrap').text(me.name);
      headerEl.find('.username-wrap').removeClass('hidden');

      headerEl.find('.thumbnail-wrap img').attr('src', me.avatar);
      headerEl.find('.thumbnail-wrap').hide();
      headerEl.find('.thumbnail-wrap').fadeOut();
      headerEl.find('.thumbnail-wrap').removeClass('hidden');
      headerEl.find('.thumbnail-wrap').fadeIn(500);

      // profile dropdown
      headerEl.find('#profile-dropdown-button').on('click', function () {
        $('#profile-dropdown-menu').toggleClass('open');
      });

      tokenTimer = setInterval(checkTokenAndUpdateProfile, 1000);

      updateUserAccountRoleOnBody();
    }
  }

  /**
   * Update body with accountrole class from localStorage
   * Profile-dropdown menu is now identical to /app/
   */
  function updateUserAccountRoleOnBody() {
    $('body').addClass('accountrole-' + (lscache.get('account_role') || 'viewer'));
  }

  initialize();

});
