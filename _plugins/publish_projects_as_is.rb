# frozen_string_literal: true

# Publishes the project websites under projects/ (git submodules) byte-for-byte.
#
# jekyll-terser minifies every non-.min.js file in the site and has no exclude
# option, so this generator runs after it and turns the project sites' scripts
# back into plain static files.
class PublishProjectsAsIs < Jekyll::Generator
  priority :lowest

  def generate(site)
    return unless defined?(Jekyll::Terser::JSFile)

    site.static_files.map! do |file|
      next file unless file.is_a?(Jekyll::Terser::JSFile) && file.relative_path.start_with?("/projects/")

      Jekyll::StaticFile.new(site, site.source, File.dirname(file.relative_path), File.basename(file.relative_path))
    end
  end
end
