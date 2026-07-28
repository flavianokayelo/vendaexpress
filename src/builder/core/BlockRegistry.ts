import type { BlockDefinition, BlockCategory } from '../types/block';

export class BlockRegistry {
  private blocks = new Map<string, BlockDefinition>();

  register(block: BlockDefinition): void {
    if (this.blocks.has(block.type)) {
      console.warn(`[BlockRegistry] Block "${block.type}" already registered — overwriting`);
    }
    this.blocks.set(block.type, block);
  }

  registerMany(blocks: BlockDefinition[]): void {
    for (const block of blocks) this.register(block);
  }

  get(type: string): BlockDefinition | undefined {
    return this.blocks.get(type);
  }

  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  getByCategory(category: BlockCategory): BlockDefinition[] {
    return this.getAll().filter((b) => b.category === category);
  }

  getCategories(): BlockCategory[] {
    const cats = new Set<BlockCategory>();
    for (const block of this.blocks.values()) cats.add(block.category);
    return Array.from(cats);
  }

  getGrouped(): Record<BlockCategory, BlockDefinition[]> {
    const grouped: Record<string, BlockDefinition[]> = {};
    for (const block of this.blocks.values()) {
      if (!grouped[block.category]) grouped[block.category] = [];
      grouped[block.category].push(block);
    }
    return grouped as Record<BlockCategory, BlockDefinition[]>;
  }

  has(type: string): boolean {
    return this.blocks.has(type);
  }

  get count(): number {
    return this.blocks.size;
  }

  clear(): void {
    this.blocks.clear();
  }
}

export const globalBlockRegistry = new BlockRegistry();
