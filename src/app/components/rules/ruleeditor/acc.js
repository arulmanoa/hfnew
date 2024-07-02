$.fn.horzAccordion = function(options) {
  // Settings and variables.
  var settings = $.extend({
      elementSelector: ".item",
      closeText: 'close',
      onOpen: function($el) {},
      onClose: function($el) {}
  }, options );
  var $elements = this.find(settings.elementSelector);
  var $mainEl = this;

  // This is where we add useful css related to this accordion.
  this.css('position', 'relative');
  this.css('overflow', 'hidden');
  $elements.css('position', 'absolute');
  $mainEl.css('height', $($elements).height());

  // Foreach element...
  for (var i=0;i<$elements.length;i++) {
      // Add the close button.
      $('<a href="#" class="accordion-close">'+settings.closeText+'</a>').appendTo($elements[i]);
      // And adjust left position.
      $($elements[i]).css('left', (i * (100 / $elements.length))+'%');
      $($elements[i]).click(function(e) {
          // This is what happens when an item is clicked.
          $(this).nextAll().removeClass('active');
          $(this).prevAll().removeClass('active');
          $(this).addClass('active');
          $(this).animate({'left': 0});
          $(this).nextAll().animate({'left': '100%'});
          settings.onOpen($(this));
          return false;
      });

      $($elements[i]).find('.accordion-close').click(function(e) {
          // This is what happens when close button clicked.
          var $curEl = $(this).closest(settings.elementSelector);
          if ($curEl.hasClass('active')) {
              // Basically we animated the left style back to item's original.
              var index = $mainEl.find(settings.elementSelector).index($curEl);
              $curEl.animate({'left': (index * (100 / $mainEl.find(settings.elementSelector).length)) + '%'}, function(ev) {
                  $curEl.removeClass('active');
              });
              settings.onClose($curEl);

              // Then revert all left position of elements after the one being clicked.
              $curEl.nextAll().each(function(id, el) {
                  var index = $mainEl.find(settings.elementSelector).index($(el));
                  $(el).animate({'left': (index * (100 / $mainEl.find(settings.elementSelector).length)) + '%'});
              });
          }
          e.stopPropagation();
          return false;
      });
  }
};

// This is how to use this plugin:
$('.items').horzAccordion({
'elementSelector': '.item',
'closeText': 'close'
});