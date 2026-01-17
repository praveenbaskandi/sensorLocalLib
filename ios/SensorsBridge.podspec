Pod::Spec.new do |s|
  s.name         = "SensorsBridge"
  s.version      = "0.1.0"
  s.summary      = "Location and Gyroscope native module"
  s.description  = "Provides native access to location and gyroscope sensors"
  s.homepage     = "https://github.com/praveenbaskandi/praveen-sensors-bridge"
  s.license      = { :type => "MIT" }
  s.author       = { "Praveen" => "baskandipraveen@gmail.com" }
  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/praveenbaskandi/praveen-sensors-bridge.git", :tag => s.version.to_s }
  s.source_files = "ios/**/*.{h,m,mm}"
  s.requires_arc = true
  s.dependency "React-Core"
end
