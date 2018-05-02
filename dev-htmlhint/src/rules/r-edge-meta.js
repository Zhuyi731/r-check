/**
 * @added by zy @2018.3.16
 * this rule is aim to check whether your header container the meta  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
 * this will make sure all ie browsers render pages in the same way and avoid some problems
 */
HTMLHint.addRule({
    id: 'r-edge-meta',
    description: '头部兼容meta标签检查',
    init: function (parser, reporter) {
        var self = this;
        var isInHead = false;
        var hasMetaCompatible = false;

        function onTagStart(event) {
            var mapAttrs = parser.getMapAttrs(event.attrs);
            var tagName = event.tagName.toLowerCase();
            if (tagName === 'head') {
                isInHead = true;
            }

            if (isInHead === true && event.tagName.toLowerCase() == "meta") {
                console.log(mapAttrs,123);
                
                if (mapAttrs["http-equiv"] !== undefined && mapAttrs.content !== undefined) {
                    hasMetaCompatible = true;
                }
            }
        }

        function onTagEnd(event) {
            if (event.tagName.toLowerCase() === 'head') {
                if (!hasMetaCompatible) {
                    reporter.error('123123123', event.line, event.col, self, event.raw);
                }
                parser.removeListener('tagstart', onTagStart);
                parser.removeListener('tagend', onTagEnd);
            }
        }
        parser.addListener('tagstart', onTagStart);
        parser.addListener('tagend', onTagEnd);
    }
});
