// https://github.com/gpbl/isomorphic500/blob/master/src/utils/IntlUtils.js

// Contains utils to download the locale data for the current language, eventually
// requiring the `Intl` polyfill for browser not supporting it
// It is used in client.js *before* rendering the root component.

import is_intl_locale_supported from 'intl-locales-supported'

const international =
{
	// Returns a promise which is resolved when Intl has been polyfilled
	load_polyfill(locale)
	{
		if (window.Intl && is_intl_locale_supported(locale))
		{
			// all fine: Intl is in the global scope and the locale data is available
			return Promise.resolve()
		}

		return new Promise((resolve) =>
		{
			debug(`Intl or locale data for "${locale}" not available, downloading the polyfill...`)

			// When building: create a intl chunk with webpack
			// When executing: run the callback once the chunk has been download.
			require.ensure(['intl'], (require) =>
			{
				require('intl') // apply the polyfill
				debug(`Intl polyfill for "${locale}" has been loaded`)
				resolve()
			},
			'intl')
		})
	},

	// Returns a promise which is resolved as the required locale-data chunks
	// has been downloaded with webpack's require.ensure. For each language,
	// we make two different chunks: one for browsers supporting `intl` and one
	// for those who don't.
	// The react-intl locale-data is required, for example, by the FormattedRelative
	// component.
	load_locale_data(locale)
	{
		const is_locale_supported = is_intl_locale_supported(locale)

		// Make sure ReactIntl is in the global scope: this is required for adding locale-data
		// Since ReactIntl needs the `Intl` polyfill to be required (sic) we must place
		// this require here, when loadIntlPolyfill is supposed to be present
		require('expose?ReactIntl!react-intl')

		return new Promise((resolve) =>
		{
			// do not remove code duplication (because Webpack won't work as expected)
			switch (locale)
			{
				// russian
				case 'ru':

					if (!is_locale_supported)
					{
						require.ensure
						([
							'intl/locale-data/jsonp/ru',
							'react-intl/dist/locale-data/ru'
						],
						(require) =>
						{
							require('intl/locale-data/jsonp/ru')
							require('react-intl/dist/locale-data/ru')
							debug(`Intl and ReactIntl locale-data for "${locale}" has been downloaded`)
							resolve()
						},
						'locale-ru')
					}
					else
					{
						require.ensure(['react-intl/dist/locale-data/ru'], (require) =>
						{
							require('react-intl/dist/locale-data/ru')
							debug(`ReactIntl locale-data for "${locale}" has been downloaded`)
							resolve()
						},
						'locale-ru-no-intl')
					}
					break

				// english
				default:
					if (!is_locale_supported)
					{
						// require.ensure
						// ([
						// 	'intl/locale-data/jsonp/en',
						// 	'react-intl/dist/locale-data/en'
						// ],
						// (require) =>
						// {
						// 	require('intl/locale-data/jsonp/en')
						// 	require('react-intl/dist/locale-data/en')
						// 	debug(`Intl and ReactIntl locale-data for "${locale}" has been downloaded`)
						// 	resolve()
						// },
						// 'locale-en')

						require.ensure
						([
							'intl/locale-data/jsonp/en'
						],
						(require) =>
						{
							require('intl/locale-data/jsonp/en')
							debug(`Intl and ReactIntl locale-data for "${locale}" has been downloaded`)
							resolve()
						},
						'locale-en')
					}
					else
					{
						// require.ensure(['react-intl/dist/locale-data/en'], (require) =>
						// {
						// 	require('react-intl/dist/locale-data/en')
						// 	debug(`ReactIntl locale-data for "${locale}" has been downloaded`)
						// 	resolve()
						// },
						// 'locale-en-no-intl')

						resolve()
					}
			}
		})
	}
}

export default international