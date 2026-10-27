# Where a product's wiki masters live: the big pictures the served sizes are cut from, with sources.json (each one's
# making, prompt and licence). They stay in the product's own private repo, never on this public site, which holds only
# the published pictures (27 Oct 2026; until then they were <product>/wiki/art-src/ here):
#   exitwise, speedometer-wallpaper   the Games repo, docs/site-art/<product>/wiki/
#   palermo                           the palermo repo (Games/palermo), docs/site-art/wiki/
# The repo is found beside the site's checkout (a worktree of the site sits deeper, so a few levels up), as the other
# tools find the Games repo; ART_REPO=<a checkout or worktree of that repo> uses another one, such as a session's own
# worktree. The tools read and write the masters there and commit nothing: commit them in that repo.
import os
import sys

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPOS = {
    'exitwise': ('Games', 'docs/site-art/exitwise/wiki'),
    'speedometer-wallpaper': ('Games', 'docs/site-art/speedometer-wallpaper/wiki'),
    'palermo': ('Games/palermo', 'docs/site-art/wiki'),
}


def art_src(product):
    """The folder of <product>'s wiki masters."""
    if product not in REPOS:
        sys.exit(f'{product}: no masters folder in tools/art_src.py')
    repo, folder = REPOS[product]
    root = os.environ.get('ART_REPO')
    up = SITE
    for _ in range(5):
        if root:
            break
        up = os.path.dirname(up)
        if os.path.exists(os.path.join(up, *repo.split('/'), '.git')):
            root = os.path.join(up, *repo.split('/'))
    if not root:
        sys.exit(f'the {repo} repo was not found beside the site: set ART_REPO to a checkout of it')
    return os.path.join(root, *folder.split('/'))
