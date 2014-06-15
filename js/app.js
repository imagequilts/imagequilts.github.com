(function(){
    var titleFromFileName = function(filename) {
        var title = '';
        var match = filename.match(/^\d+\-(.*)\.png$/);
        if (!match || match.length !== 2) {
            return undefined;
        }
        var name = match[1];
        var words = name.split(' ');
        $.each(words, function(i, word){
            words[i] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
        return words.join(' ');
    };

    window.loadQuilts = function(quilts) {
        var quiltsHTML = '';
        var sortRegex = /^(\d+)\-.*$/
        quilts.sort(function(a, b){
            var aValue = '';
            var bValue = '';
            var aMatch = a.filename.match(sortRegex);
            if (aMatch && aMatch.length == 2) {
                aValue = parseInt(aMatch[1], 10);
            }
            var bMatch = b.filename.match(sortRegex);
            if (bMatch && bMatch.length == 2) {
                bValue = parseInt(bMatch[1], 10);
            }
            if (aValue < bValue) return -1;
            if (aValue > bValue) return 1;
            return 0;
        });
        $.each(quilts, function(i, quilt){
            var title = titleFromFileName(quilt.filename);
            if (title) {
                var isText = false;
                var match = title.match(/(.*)\.text$/);
                if (match && match.length == 2) {
                    isText = true;
                }
                quiltsHTML += '' +
                    '<div class="quilt ' + (isText === true ? 'text' : '') +'">' +
                        '<div class="quilt-inner">' +
                            (isText === true ? '' : '<h3>' + title + '</h3>') +
                            '<div class="image-container">' +
                                '<img data-src="' + quilt.dl_url + '">' + // TODO - use orig_url instead?
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '';
            }
        });

        $('.quilts-inner').html(quiltsHTML);
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

            var originalHeight = parseInt($fullscreenImage.attr('original-height'), 10);
            var originalWidth = parseInt($fullscreenImage.attr('original-width'), 10);

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

        if (isPreview === true) {
            $('.header').append(
                $('<div class="preview-actions">')
                    .append(
                        $('<a>Generate Preview</a>').click(function(){
                            var $link = $(this);
                            $('.preview-actions .message').text('Generating preview...');
                            $.ajax({
                                url: 'http://' + server + 'generate/index.php?preview=true',
                                complete: function() {
                                    $('.preview-actions .message').html('Preview generated. Refreshing...');
                                    window.location.reload();
                                }
                            });
                        })
                    )
                    .append(
                        $('<a>Publish</a>').click(function(){
                            var password = prompt("Enter publish password:");
                            if (password) {
                                var $link = $(this);
                                $('.preview-actions .message').text('Publishing...');
                                $.ajax({
                                    url: 'http://' + server + 'generate/index.php?password=' + password,
                                    complete: function() {
                                        $('.preview-actions .message').html('Published');
                                        $link.text('Publish');
                                    }
                                });
                            }
                        })
                    )
                    .append('<div class="message">&nbsp;</div>')
            );
        }
    };

    var isPreview = location.search === '?preview';
    var server = (location.hostname === 'localhost') ? 'localhost:8888/ImageQuiltsServer/' : 'polymath.mit.edu/projects/imagequilts/';
    var dataPath = isPreview === true ? 'data/preview.js' : 'data/live.js';
    $.getScript('http://' + server + dataPath);

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
})();
