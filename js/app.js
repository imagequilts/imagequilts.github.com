(function(){
    $(window).scroll(function(){
        var $lazyImages = $('[data-src]');
        var scrollPosition = $(window).scrollTop() + $(window).outerHeight();
        $lazyImages.each(function(){
            var $img = $(this);
            if ($img.parent().attr('loaded'))
                return;
            $img.parent().addClass('loading');
            if (scrollPosition > ($(this).offset().top - 1000)) {
                var src = $(this).attr('data-src');
                var $newImage = $('<img>');
                $img.after($newImage);
                $img.remove();
                $newImage.attr('src', src);
                $newImage.load(function(){
                    $newImage.parent().removeClass('loading');
                    $newImage.parent().attr('loaded', true);
                    $newImage.attr('original-height', this.height);
                    $newImage.attr('original-width', this.width);
                });
            }
        })
    });

    var loadQuilts = function() {
        $(window).scroll();

        $('.quilts-inner').on('click', 'img', function(){
            var $img = $(this);
            var $quilt = $img.parents('.quilt');

            if ($img.parents('.image-container').hasClass('loading')) {
                return;
            }

            if ($quilt.attr('fullscreen')) {
                $quilt.removeAttr('fullscreen');
                $img.css({
                    height: '100%',
                    width: '100%'
                });
            } else {
                $quilt.attr('fullscreen', true);
                constrainFullScreenImageQuilt();
            }
        });

        var constrainFullScreenImageQuilt = function() {
            $fullscreenImage = $('.quilt[fullscreen] img');

            var originalHeight = parseInt($fullscreenImage.attr('original-height'), 10) * 10;
            var originalWidth = parseInt($fullscreenImage.attr('original-width'), 10) * 10;

            var height = originalHeight;
            var width = originalWidth;

            var windowHeight = $(window).height();
            var windowWidth = $(window).width();

            if (height > windowHeight) {
                height = windowHeight - 20;
                width = (height / originalHeight) * originalWidth;
            }

            if (width > windowWidth) {
                width = windowWidth - 20;
                height = (width / originalWidth) * originalHeight;
            }

            if ($fullscreenImage.length) {
                $fullscreenImage.css({
                    height: height,
                    width: width
                });
            }
        };

        $(window).resize(function(){
            constrainFullScreenImageQuilt();
        });
    };

    loadQuilts();
})();