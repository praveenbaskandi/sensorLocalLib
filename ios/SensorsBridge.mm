#import "SensorsBridge.h"
#import <CoreLocation/CoreLocation.h>
#import <CoreMotion/CoreMotion.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTLog.h>
#import <objc/runtime.h>

@interface SensorsBridge () <CLLocationManagerDelegate>
@end

@implementation SensorsBridge {
  CLLocationManager *_locationManager;
  CMMotionManager *_motionManager;
  BOOL _hasListeners;
}

static char kResolveKey;
static char kRejectKey;

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"onLocationUpdate", @"onLocationError", @"onGyroUpdate", @"onGyroError"
  ];
}

- (void)startObserving {
  _hasListeners = YES;
}

- (void)stopObserving {
  _hasListeners = NO;
}

#pragma mark - Location

RCT_EXPORT_METHOD(isLocationServiceEnabled : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject) {
  resolve(@([CLLocationManager locationServicesEnabled]));
}

RCT_EXPORT_METHOD(getCurrentLocation : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject) {

  dispatch_async(dispatch_get_main_queue(), ^{
    if (![CLLocationManager locationServicesEnabled]) {
      reject(@"location_disabled", @"Location services disabled", nil);
      return;
    }

    CLLocationManager *manager = [[CLLocationManager alloc] init];
    manager.delegate = self;
    manager.desiredAccuracy = kCLLocationAccuracyBest;

    [manager requestWhenInUseAuthorization];
    [manager requestLocation];

    objc_setAssociatedObject(manager, &kResolveKey, resolve,
                             OBJC_ASSOCIATION_COPY);
    objc_setAssociatedObject(manager, &kRejectKey, reject,
                             OBJC_ASSOCIATION_COPY);
  });
}

RCT_EXPORT_METHOD(startSensors : (NSDictionary *)config resolver : (
    RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)reject) {

  dispatch_async(dispatch_get_main_queue(), ^{
    [self startLocationUpdates:config];
    [self startGyroUpdates:config];
    resolve(@(YES));
  });
}

RCT_EXPORT_METHOD(stopSensors : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject) {

  dispatch_async(dispatch_get_main_queue(), ^{
    [_locationManager stopUpdatingLocation];
    [_motionManager stopGyroUpdates];
    resolve(@(YES));
  });
}

- (void)startLocationUpdates:(NSDictionary *)config {

  _locationManager = [[CLLocationManager alloc] init];
  _locationManager.delegate = self;

  NSString *accuracy = config[@"locationAccuracy"];
  if ([accuracy isEqualToString:@"low"]) {
    _locationManager.desiredAccuracy = kCLLocationAccuracyKilometer;
  } else if ([accuracy isEqualToString:@"balanced"]) {
    _locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters;
  } else {
    _locationManager.desiredAccuracy = kCLLocationAccuracyBest;
  }

  [_locationManager requestWhenInUseAuthorization];
  [_locationManager startUpdatingLocation];
}

#pragma mark - Gyroscope

- (void)startGyroUpdates:(NSDictionary *)config {

  _motionManager = [[CMMotionManager alloc] init];

  if (!_motionManager.isGyroAvailable) {
    if (_hasListeners) {
      [self sendEventWithName:@"onGyroError"
                         body:@{
                           @"code" : @"sensor_unavailable",
                           @"message" : @"Gyro not available"
                         }];
    }
    return;
  }

  NSNumber *interval = config[@"gyroIntervalMs"] ?: @(50);
  _motionManager.gyroUpdateInterval = interval.doubleValue / 1000.0;

  [_motionManager
      startGyroUpdatesToQueue:[NSOperationQueue mainQueue]
                  withHandler:^(CMGyroData *data, NSError *error) {
                    if (error) {
                      if (self->_hasListeners) {
                        [self sendEventWithName:@"onGyroError"
                                           body:@{
                                             @"code" : @"gyro_error",
                                             @"message" :
                                                 error.localizedDescription
                                           }];
                      }
                      return;
                    }

                    if (self->_hasListeners) {
                      [self sendEventWithName:@"onGyroUpdate"
                                         body:@{
                                           @"x" : @(data.rotationRate.x),
                                           @"y" : @(data.rotationRate.y),
                                           @"z" : @(data.rotationRate.z),
                                           @"timestamp" :
                                               @([[NSDate date]
                                                     timeIntervalSince1970] *
                                                 1000)
                                         }];
                    }
                  }];
}

#pragma mark - CLLocation delegate

- (void)locationManager:(CLLocationManager *)manager
     didUpdateLocations:(NSArray<CLLocation *> *)locations {

  CLLocation *loc = locations.lastObject;
  if (!loc)
    return;

  NSDictionary *payload = @{
    @"latitude" : @(loc.coordinate.latitude),
    @"longitude" : @(loc.coordinate.longitude),
    @"accuracy" : @(loc.horizontalAccuracy),
    @"altitude" : @(loc.altitude),
    @"speed" : @(loc.speed),
    @"heading" : @(loc.course),
    @"timestamp" : @([loc.timestamp timeIntervalSince1970] * 1000)
  };

  if (_hasListeners) {
    [self sendEventWithName:@"onLocationUpdate" body:payload];
  }

  RCTPromiseResolveBlock resolve =
      objc_getAssociatedObject(manager, &kResolveKey);
  if (resolve) {
    resolve(payload);
    objc_setAssociatedObject(manager, &kResolveKey, nil, OBJC_ASSOCIATION_COPY);
  }
}

- (void)locationManager:(CLLocationManager *)manager
       didFailWithError:(NSError *)error {

  RCTPromiseRejectBlock reject = objc_getAssociatedObject(manager, &kRejectKey);

  NSString *errorCode = @"location_error";
  if (error.domain == kCLErrorDomain && error.code == kCLErrorDenied) {
    errorCode = @"permission_denied";
  }

  if (reject) {
    reject(errorCode, error.localizedDescription, error);
    objc_setAssociatedObject(manager, &kRejectKey, nil, OBJC_ASSOCIATION_COPY);
  }

  if (_hasListeners) {
    [self sendEventWithName:@"onLocationError"
                       body:@{
                         @"code" : errorCode,
                         @"message" : error.localizedDescription
                       }];
  }
}

@end
