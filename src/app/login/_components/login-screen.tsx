import { Card, CardContent } from "@/components/ui/card";
import MarqueeGallery from "@/components/ui/marquee-gallery";
import { APP_CONFIG } from "@/config/app-config";

import { LoginPanel } from "./login-panel";

const galleryImages = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=380&auto=format&fit=crop",
];

export function LoginScreen() {
  return (
    <div className="h-dvh lg:grid lg:grid-cols-2">
      <div className="bg-background h-screen p-5 max-lg:hidden">
        <Card className="bg-primary relative h-full justify-end overflow-hidden border-none pt-0">
          <CardContent className="relative z-1 flex h-full flex-col justify-end overflow-hidden px-0 pb-10 xl:pb-16">
            <MarqueeGallery images={galleryImages} className="absolute inset-0" overlayColor="var(--primary)" />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-5"
              style={{ height: "95%", background: "linear-gradient(to top, var(--primary), transparent)" }}
            />
            <div className="text-primary-foreground relative z-10 px-10 xl:px-16">
              <h1 className="mb-3 text-3xl leading-[1.2] font-bold uppercase xl:mb-6 xl:text-6xl">
                YOUR
                <br />
                NEXT ADVENTURE
                <br />
                AWAITS!
              </h1>
              <p className="text-lg xl:text-xl">
                Manage flights, bookings, and operations from the {APP_CONFIG.name} admin dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex h-full items-center justify-center sm:px-6 md:px-8">
        <LoginPanel />
      </div>
    </div>
  );
}
