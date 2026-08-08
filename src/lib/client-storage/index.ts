import * as preferences from './preferences';
import * as cart from './cart';
import * as recentlyViewed from './recentlyViewed';
import * as onboarding from './onboarding';
import * as navigation from './navigation';
import * as profile from './profile';
import * as address from './address';
import * as hours from './hours';
import * as storage from './storage';

export { storage as storageCore };
export {
  preferences,
  cart,
  recentlyViewed,
  onboarding,
  navigation,
  profile,
  address,
  hours,
};
export * from './preferences';
export * from './cart';
export * from './recentlyViewed';
export * from './onboarding';
export * from './navigation';
export * from './profile';
export * from './address';
export * from './hours';

export const veStorage = {
  preferences,
  cart,
  recentlyViewed,
  onboarding,
  navigation,
  profile,
  address,
  hours,
};