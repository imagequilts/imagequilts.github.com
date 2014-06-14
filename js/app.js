(function(){
    var titleFromFileName = function(filename) {
        var title = '';
        var name = filename.match(/^\d+\-(.*)\.png$/)[1];
        var words = name.split(' ');
        $.each(words, function(i, word){
            words[i] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
        return words.join(' ');
    };

    window.loadQuilts = function(quilts) {
        var quiltsHTML = '';
        $.each(quilts, function(i, quilt){
            var title = titleFromFileName(quilt.filename);
            var text = false;
            if (title.toLowerCase().split('text').length > 1) {
                text = true;
            }
            quiltsHTML += '' +
                '<div class="quilt ' + (text === true ? 'text' : '') +'">' +
                    (text === true ? '' : '<h3>' + title + '</h3>') +
                    '<div class="image-container">' +
                        '<img ' + (i > 0 ? 'data-' : '') + 'src="' + quilt.dl_url + '">' + // TODO - use orig_url instead?
                    '</div>' +
                '</div>' +
            '';
        });
        $('.quilts-inner').html(quiltsHTML);

        if (isPreview === true) {
            $('.header').append(
                $('<div class="preview-actions">')
                    .append(
                        $('<a>Generate Preview</a>').click(function(){
                            var $link = $(this);
                            $link.text('Generating preview...');
                            $.get('http://' + server + 'generate/index.php?preview=true', function(){
                                $link.text('Done');
                                window.location.reload();
                            });
                        })
                    )
                    .append(
                        $('<a>Publish</a>').click(function(){
                            var $link = $(this);
                            $link.text('Publishing...');
                            $.get('http://' + server + 'generate/index.php', function(){
                                $link.text('Published');
                                location.href = location.protocol + '//' + location.host + location.pathname;
                            });
                        })
                    )
            );
        }
    };

    var isPreview = location.search === '?preview';
    var server = (location.hostname === 'localhost' && false) ? 'localhost:8888/ImageQuiltsServer/' : 'polymath.mit.edu/projects/imagequilts/';
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
