import {
  CalendarCheck,
  CreditCard,
  EllipsisVertical,
  Eye,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  MessageCircleQuestion,
  Package,
  Pencil,
  PencilLine,
  Plus,
  Shield,
  Star,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  CalendarCheckIcon: CalendarCheck,
  CreditCardIcon: CreditCard,
  EllipsisVerticalIcon: EllipsisVertical,
  EyeIcon: Eye,
  FileTextIcon: FileText,
  LayoutDashboardIcon: LayoutDashboard,
  MessageCircleQuestionIcon: MessageCircleQuestion,
  PackageIcon: Package,
  PencilIcon: Pencil,
  PencilLineIcon: PencilLine,
  PlusIcon: Plus,
  ShieldIcon: Shield,
  StarIcon: Star,
  TicketIcon: Ticket,
  Trash2Icon: Trash2,
  UsersIcon: Users,
};

type IconPlaceholderProps = {
  lucide: string;
  className?: string;
  tabler?: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
};

export function IconPlaceholder({ lucide, className }: IconPlaceholderProps) {
  const Icon = icons[lucide];
  if (!Icon) return null;
  return <Icon className={className} />;
}
