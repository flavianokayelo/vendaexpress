export { BuilderProvider, BuilderContext } from './BuilderProvider';
export { useBuilder } from './hooks/useBuilderContext';
export { useBuilderEngine } from './hooks/useBuilder';
export { useDevicePreview } from './hooks/useDevicePreview';
export { BuilderEditor } from './components/editor/BuilderPage';
export { BuilderCanvas } from './components/editor/BuilderCanvas';
export { BuilderSidebar } from './components/editor/BuilderSidebar';
export { BuilderInspector } from './components/editor/BuilderInspector';
export { BuilderToolbar } from './components/editor/BuilderToolbar';
export { EmptyState } from './components/shared/EmptyState';
export { BlockWrapper } from './components/shared/BlockWrapper';
export { globalBlockRegistry, BlockRegistry } from './core/BlockRegistry';
export { editorReducer, initialEditorState } from './core/BuilderEngine';
export { Serializer } from './core/Serializer';
export { createSection, mergeDefaults, cloneSection } from './utils/defaults';

export { heroBlock } from './components/blocks/HeroBlock';
export { textBlock } from './components/blocks/TextBlock';
export { imageTextBlock } from './components/blocks/ImageText';
export { galleryBlock } from './components/blocks/GalleryBlock';
export { videoBlock } from './components/blocks/VideoBlock';
export { productGridBlock } from './components/blocks/ProductGrid';
export { productFeaturedBlock } from './components/blocks/ProductFeatured';
export { categoryListBlock } from './components/blocks/CategoryList';
export { promoBannerBlock } from './components/blocks/PromoBanner';
export { testimonialsBlock } from './components/blocks/Testimonials';
export { faqBlock } from './components/blocks/FAQBlock';
export { newsletterBlock } from './components/blocks/Newsletter';
export { footerLinksBlock } from './components/blocks/FooterLinks';
export { socialLinksBlock } from './components/blocks/SocialLinks';

import { heroBlock } from './components/blocks/HeroBlock';
import { textBlock } from './components/blocks/TextBlock';
import { imageTextBlock } from './components/blocks/ImageText';
import { galleryBlock } from './components/blocks/GalleryBlock';
import { videoBlock } from './components/blocks/VideoBlock';
import { productGridBlock } from './components/blocks/ProductGrid';
import { productFeaturedBlock } from './components/blocks/ProductFeatured';
import { categoryListBlock } from './components/blocks/CategoryList';
import { promoBannerBlock } from './components/blocks/PromoBanner';
import { testimonialsBlock } from './components/blocks/Testimonials';
import { faqBlock } from './components/blocks/FAQBlock';
import { newsletterBlock } from './components/blocks/Newsletter';
import { footerLinksBlock } from './components/blocks/FooterLinks';
import { socialLinksBlock } from './components/blocks/SocialLinks';
import { globalBlockRegistry } from './core/BlockRegistry';

export function registerAllBlocks(): void {
  const blocks = [
    heroBlock, textBlock, imageTextBlock, galleryBlock, videoBlock,
    productGridBlock, productFeaturedBlock, categoryListBlock,
    promoBannerBlock, testimonialsBlock, faqBlock, newsletterBlock,
    footerLinksBlock, socialLinksBlock,
  ];
  for (const block of blocks) {
    globalBlockRegistry.register(block);
  }
}

export type {
  BlockDefinition, BlockSchema, BlockProps, EditorProps,
  BlockComponent, EditorComponent, BlockCategory,
  FieldSchema, FieldType, FieldOption,
  BlockSettings, BlockStyles, BlockInstance,
} from './types/block';

export type {
  Page, PageSection, PageMeta, PageStatus, PageTemplate,
  PageCreate, PageUpdate, PageExport,
} from './types/page';

export type {
  EditorState, EditorAction, EditorHistoryEntry,
  DeviceMode, EditorMode, BuilderContextType,
} from './types/editor';

export { BLOCK_CATEGORIES } from './types/block';
export { PAGE_TEMPLATES } from './types/page';
