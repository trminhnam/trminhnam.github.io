# frozen_string_literal: true

# Lets a page whose permalink is a full URL serve only as a navbar link.
#
# al_folio_core's navbar links a page with `permalink: https://...` straight to
# that URL, but Jekyll still writes the page itself, to a path like
# _site/https:/trminhnam.github.io/notes/index.html. The navbar is already in
# every rendered page by the time this hook runs, so dropping these pages here
# keeps the links and skips writing the stray files.
Jekyll::Hooks.register :site, :post_render do |site|
  site.pages.reject! { |page| page.permalink.to_s.include?("://") }
end
