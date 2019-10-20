const Assert = require('assert');
const Api = require('laravel-mix/src/Api');
const proxyMethod = require('proxy-method');

class LaravelMixVueExtractionOptions {

    /**
     * Install the plugin for Laravel Mix.
     *
     * @param {Api} mix
     */
    static installPlugin(mix) {

        Assert(mix instanceof Api, 'Expecting valid instance of Laravel Mix Api.');

        mix.extend('vueExtraction', new class {

            /**
             * Register appropriate listener to apply the overloading.
             */
            boot() {

                // override method to allow for filename method
                Mix.listen('configReady', () => {

                    const vue = Mix.components.get('js').vue;

                    proxyMethod.after(vue, 'extractFileName', filename => {

                        const config = Config.extractVueStyles;

                        if (typeof config !== 'object' || typeof config.filename !== 'function') {
                            return filename;
                        }

                        return config;

                    }, true);

                });

            }

            /**
             * Configure Vue style extraction.
             *
             * Example:
             * mix.vueExtraction('css/vue[name].css', /^(.*)vue\/js\/(.*)\.css$/i, '$1$2-vue.css')
             *
             * @param {String|Function|Boolean} filename
             * @param {String|RegExp|null} find
             * @param {String|null} replace
             */
            register(filename, find = null, replace = null) {

                let type = typeof filename;

                if (type === 'string') {

                    if (find !== null) {

                        Assert(
                            typeof find === 'string' || find instanceof RegExp,
                            'Expecting valid find of type string or instance of RegExp.'
                        );

                        Assert(typeof replace === 'string', 'Expecting valid replace string.');

                        filename = {filename: getPath => getPath.replace(find, replace)};

                    }

                } else if (type === 'function') {
                    filename = {filename};
                } else if (type !== 'boolean') {
                    Assert(false, 'Expecting valid filename of type string, function, or boolean.');
                }

                mix.options({extractVueStyles: filename});

            }

        });

    }

}

module.exports = LaravelMixVueExtractionOptions;