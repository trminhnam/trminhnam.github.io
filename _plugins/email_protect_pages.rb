# frozen_string_literal: true

# Applies al_email_protect to every rendered HTML page when `protect_email: true`.
#
# al_email_protect ships the click-to-copy CSS/JS and an HTML rewriter, but
# al_folio_core (1.0.15) never runs the rewriter, so `mailto:` links from
# jekyll-socials and from page content would otherwise stay in plain text.
# The gem's own rewrite_html (1.0.1) also pastes the link's other attributes
# into its class attribute (`class="al-email-protect title="Email""`), so the
# rewrite is done here with the gem's helpers instead.
# Remove this file once the theme wires a working rewriter in itself.
module EmailProtectPages
  module_function

  def rewrite(html)
    html.gsub(AlEmailProtect::ANCHOR) do
      match = Regexp.last_match
      parts = AlEmailProtect.split_address(AlEmailProtect.decode_target(match[3]))
      next match[0] unless parts

      local, domain = parts
      attributes = " #{match[1]} #{match[4]}".gsub(/\s+/, " ").rstrip
      label = match[5]
      if label.include?("@")
        label = "#{AlEmailProtect.escape(local)}<span class=\"al-email-sep\"> [at] </span>#{AlEmailProtect.domain_markup(domain)}"
      end

      %(<a href="#" class="al-email-protect" data-eu="#{AlEmailProtect.escape(local)}" ) +
        %(data-ed="#{AlEmailProtect.escape(domain)}"#{attributes}>#{label}</a>)
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |doc|
  next unless defined?(AlEmailProtect) && AlEmailProtect.enabled?(doc.site)
  next unless doc.output_ext == ".html" && doc.output.include?("mailto:")

  doc.output = EmailProtectPages.rewrite(doc.output)
end
