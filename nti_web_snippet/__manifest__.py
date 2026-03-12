# -*- coding: utf-8 -*-

{
    "name": "NTI Website Snippets",
    "version": "18.0.1.0.0",
    "category": "Website",
    "summary": "Custom website snippets (Marquee Logo)",
    "author": "NTI",
    "license": "LGPL-3",
    "depends": ["website"],
    "data": [
        "views/snippets/snippets.xml",
        "views/snippets/s_nti_marquee.xml",
        "views/snippets/s_nti_marquee_inner.xml",
        "views/snippets/s_nti_card_marquee.xml",
        "views/snippets/s_nti_feedback_marquee.xml",
        "views/snippets/options.xml",
    ],
    "assets": {
        "web.assets_frontend": [
            "nti_web_snippet/static/src/snippets/**/*.js",
            "nti_web_snippet/static/src/snippets/**/*.scss",
        ],
    },
    "installable": True,
    "application": False,
}

