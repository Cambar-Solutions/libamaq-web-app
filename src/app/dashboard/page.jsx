import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CardImg from "@/components/ui/CardImg";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Datos de las tarjetas
const cardData = [
  { id: 1, title: "Taladro reversible", description: "GBM 1600 RE", img: "/hG3Liriw.png" },
  { id: 2, title: "Sierra Ingleteadora", description: "GCM 254",  img: "/E9mJXFeQ.png"},
  { id: 3, title: "Taladro reversible", description: "GBM 16-2 RE", img: "/taladroo.png" },
];

const CardComponent = ({ title, description,  img }) => (
  <Card>
    <CardHeader>
      <CardImg img={img} altText={title} />
      <CardTitle className="mt-3">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

export default function Page() {
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                {cardData.map((card) => (
                  <CardComponent key={card.id} {...card} />
                ))}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
