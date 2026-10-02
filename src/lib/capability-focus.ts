// Editorial connections for navigating a capability across the architecture.
// A connection does not assign the capability's score to an entire component.
export const capabilityFocus: Record<string, string[]> = {
  'Boot to SpringBoard': ['hardware:CPU','kernel:Mach','apps:SpringBoard'],
  'iPhone userspace to home screen': ['kernel:BSD','services:UIKit','apps:SpringBoard'],
  'Checked storage & persistence': ['kernel:IOKit','kernel:BSD'],
  'Unattended recovery': ['hardware:CPU','kernel:Mach'],
  'Framebuffer to panel': ['hardware:Display','kernel:IOKit','services:CoreSurface'],
  'Backlight fade & blanking': ['hardware:Display','kernel:IOKit'],
  'Brightness control': ['hardware:Display','kernel:IOKit','services:UIKit'],
  'Touch input': ['kernel:IOKit','services:UIKit','apps:SpringBoard'],
  'Multitouch & pinch-zoom': ['kernel:IOKit','services:UIKit','apps:Photos'],
  'Physical buttons': ['kernel:IOKit','services:UIKit','apps:SpringBoard'],
  'Screenshots': ['services:CoreSurface','apps:SpringBoard'],
  'Live viewfinder': ['hardware:OV5640','kernel:IOKit','services:CoreSurface','apps:Camera'],
  'Photo capture & save': ['hardware:OV5640','kernel:IOKit','services:PhotoLibrary','apps:Camera','apps:Photos'],
  'Full-resolution stills': ['hardware:OV5640','services:PhotoLibrary','apps:Camera'],
  'Battery status': ['kernel:IOKit','services:UIKit','apps:SpringBoard'],
  'Charge budget': ['kernel:IOKit'],
  'Sleep / suspend': ['hardware:CPU','kernel:Mach'],
  'CPU frequency scaling': ['hardware:CPU','kernel:Mach'],
  'Hot-trap removal': ['hardware:CPU','kernel:Mach'],
  'Audio output': ['kernel:IOKit'],
  'Networking / Wi-Fi': ['kernel:IOKit','kernel:BSD'],
  'Telephony': ['kernel:IOKit'],
};
export const capabilityKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
