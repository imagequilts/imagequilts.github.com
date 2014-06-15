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
        var quiltNumber = 0;
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
                                '<img ' + (quiltNumber > 0 ? 'data-' : '') + 'src="' + quilt.dl_url + '">' + // TODO - use orig_url instead?
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '';
                if (!isText) {
                    quiltNumber += 1;
                }
            }
        });

        $('.quilts-inner').html(quiltsHTML);

        $('.quilts-inner > .quilt:not(".text") img').each(function(){
            var $img = $(this);
            var $quilt = $img.parents('.quilt');
            $img.click(function(){
                if ($quilt.attr('fullscreen')) {
                    $quilt.removeAttr('fullscreen');
                } else {
                    $quilt.attr('fullscreen', true);
                }
            });
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
            if (scrollPosition > $(this).offset().top) {
                var src = $(this).attr('data-src');
                var img = new Image();
                img.onload = function() {
                    $img.parent().removeClass('loading');
                    $img.parent().attr('loaded', true);
                    $img.attr('src', src);
                };
                img.src = src;
            }
        })
    });
})();
