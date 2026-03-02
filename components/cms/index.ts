// Layout
export { CMSSidebar } from "./cms-sidebar";
export { CMSHeader } from "./cms-header";

// Tables & Forms
export { ProductTable, ProductForm } from "./products";
export { CategoryTable, CategoryForm } from "./categories";
export { BlogTable, BlogForm } from "./blogs";
export { UserTable, UserForm } from "./users";
export { DevisTable, DevisDetail, StatusUpdateDialog } from "./devis";
export { MediaGrid, ViewToggle, UploadDialog, MediaSelector, ImageInput, ImageGalleryInput } from "./media";

// Shared Components
export { StatsCard, StatsCardGrid, type StatsCardProps } from "./stats-card";
export { EmptyState, EmptyStatePresets, type EmptyStateProps } from "./empty-state";
export { SearchInput, type SearchInputProps } from "./search-input";
export { CMSPagination, type PaginationState, type CMSPaginationProps } from "./pagination";
export {
  ConfirmationDialog,
  DeleteConfirmationDialog,
  useConfirmationDialog,
  type ConfirmationDialogProps,
  type DeleteConfirmationDialogProps,
} from "./confirmation-dialog";

// Responsive Components
export {
  ResponsiveTable,
  ScrollableTableWrapper,
  MobileDataCard,
  type Column as ResponsiveTableColumn,
  type ResponsiveTableProps,
  type MobileDataCardProps,
} from "./responsive-table";
