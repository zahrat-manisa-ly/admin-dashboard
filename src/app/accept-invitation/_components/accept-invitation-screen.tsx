import Link from "next/link";

import { ChevronLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarqueeGallery from "@/components/ui/marquee-gallery";
import { APP_CONFIG } from "@/config/app-config";

import { AcceptInvitationForm } from "./accept-invitation-form";

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

export function AcceptInvitationScreen({ token }: { token: string }) {
  return (
    <div className="h-dvh lg:grid lg:grid-cols-2">
      {/* //--------brand-panel----// */}
      <div className="h-screen bg-background p-5 max-lg:hidden">
        <Card className="relative h-full justify-end overflow-hidden border-none bg-primary pt-0">
          <CardContent className="relative z-1 flex h-full flex-col justify-end overflow-hidden rounded-2xl px-0 pb-10 xl:pb-16">
            <MarqueeGallery images={galleryImages} className="absolute inset-0" overlayColor="var(--primary)" />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-5"
              style={{ height: "95%", background: "linear-gradient(to top, var(--primary), transparent)" }}
            />
            <div className="relative z-10 px-10 text-primary-foreground xl:px-16">
              <h1 className="mb-3 font-bold text-3xl uppercase leading-[1.2] xl:mb-6 xl:text-6xl">
                Join
                <br />
                the
                <br />
                team
              </h1>
              <p className="text-lg xl:text-xl">
                Accept your invitation to {APP_CONFIG.name} and set a password to access the admin dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* //-------end-brand-panel----// */}

      {/* //--------form-panel----// */}
      <div className="flex h-full items-center justify-center sm:px-6 md:px-8">
        <div className="flex w-full max-w-lg flex-col gap-6 p-6">
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold text-2xl md:text-3xl lg:text-4xl">Accept invitation</h2>
            <p className="text-muted-foreground">
              Create a password for your {APP_CONFIG.name} account. It must be at least 8 characters.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <AcceptInvitationForm token={token} />

            <Button variant="ghost" className="group w-full" asChild>
              <Link href="/login">
                <ChevronLeftIcon
                  data-icon="inline-start"
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
                Back to login
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {/* //-------end-form-panel----// */}
    </div>
  );
}
