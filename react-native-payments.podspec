require 'json'
pkg = JSON.parse(File.read("package.json"))
repo = pkg["repository"]
repo_url = repo.is_a?(Hash) ? repo["url"] : repo

Pod::Spec.new do |s|
  s.name             = (pkg["harmony"] && pkg["harmony"]["alias"]) || "react-native-payments"
  s.version          = pkg["version"]
  s.summary          = pkg["description"]
  s.requires_arc     = true
  s.license          = pkg["license"]
  s.homepage         = pkg["homepage"]
  s.author           = pkg["author"]
  s.source           = { :git => repo_url }
  s.source_files     = 'ios/**/*.{h,m}'
  s.platform         = :ios, "8.0"
  s.requires_arc     = true

  s.dependency 'React'
  s.dependency 'Stripe', '~> 19'
  s.dependency 'Braintree', '~> 4'
end
