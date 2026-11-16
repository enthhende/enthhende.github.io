"""Validate homepage game/series metadata before publication (standard library only)."""
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


class Catalog(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.games = []
        self.platforms = set()
        self.in_series = False
        self.series_json = ''

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'article' and 'gameCard' in attrs.get('class', '').split():
            self.games.append(attrs)
        if tag == 'button' and 'data-platform' in attrs:
            self.platforms.add(attrs['data-platform'])
        if tag == 'script' and attrs.get('id') == 'catalogSeriesData':
            self.in_series = True

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_series = False

    def handle_data(self, data):
        if self.in_series:
            self.series_json += data


def check(path):
    catalog = Catalog()
    catalog.feed(path.read_text())
    assert len(catalog.ids) == len(set(catalog.ids)), 'Duplicate HTML ID'
    assert 'catalogSeriesData' in catalog.ids, 'Missing catalogSeriesData'
    series = json.loads(catalog.series_json)
    assert isinstance(series, dict), 'Series metadata must be an object'
    for key, definition in series.items():
        assert re.fullmatch(r'[a-z][a-z0-9-]*', key), f'Invalid series ID: {key}'
        assert isinstance(definition, dict), key
        assert isinstance(definition.get('title'), str) and definition['title'].strip(), key
        assert isinstance(definition.get('aliases', []), list), f'{key}: aliases must be an array'
        assert all(isinstance(alias, str) for alias in definition.get('aliases', [])), key
        for field in ['description', 'icon', 'image']:
            assert field not in definition or isinstance(definition[field], str), f'{key}: {field}'
        if definition.get('image'):
            assert (ROOT / definition['image']).is_file(), f'{key}: local image missing'
        assert 'series-' + key not in catalog.ids, f'{key}: generated ID collision'
        assert 'series-' + key + '-title' not in catalog.ids, f'{key}: title ID collision'
    published = []
    for game in catalog.games:
        assert game.get('id', '').startswith('game-'), 'Game needs a unique game-* ID'
        assert game.get('data-title', '').strip(), game['id']
        platforms = game.get('data-platforms', '').split()
        assert platforms and set(platforms) <= catalog.platforms - {'all'}, game['id']
        assert game.get('data-published', 'true') in ('true', 'false'), game['id']
        if game.get('data-series'):
            assert game['data-series'] in series, f'{game["id"]}: undefined series'
        if game.get('data-published') != 'false':
            published.append(game)
    populated = {game['data-series'] for game in published if game.get('data-series')}
    print(f'{path.name}: {len(published)} published games, {len(populated)} populated series; metadata OK')


if __name__ == '__main__':
    check(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'index.html')
