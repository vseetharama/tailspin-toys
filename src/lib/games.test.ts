import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllGames,
    getAllGameIds,
    getAllCategories,
    getAllPublishers,
    getGameById,
} from './games';

async function seedGames(db: Database, count: number): Promise<void> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }
}

async function seedGamesForFiltering(db: Database): Promise<{ strategyId: number; puzzleId: number; pubOneId: number; pubTwoId: number }> {
    const [strategy] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [puzzle] = await db
        .insert(categories)
        .values({ name: 'Puzzle', description: 'cat' })
        .returning({ id: categories.id });
    const [pubOne] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });
    const [pubTwo] = await db
        .insert(publishers)
        .values({ name: 'Pub Two', description: 'pub' })
        .returning({ id: publishers.id });

    await db.insert(games).values([
        { title: 'Alpha Tactics', description: 'Strategy game', starRating: 4.1, categoryId: strategy.id, publisherId: pubOne.id },
        { title: 'Brilliant Maze', description: 'Puzzle game', starRating: 4.3, categoryId: puzzle.id, publisherId: pubTwo.id },
        { title: 'Castle Conquest', description: 'Strategy game', starRating: 4.5, categoryId: strategy.id, publisherId: pubTwo.id },
        { title: 'Zen Logic', description: 'Puzzle game', starRating: 4.0, categoryId: puzzle.id, publisherId: pubOne.id },
    ]);

    return { strategyId: strategy.id, puzzleId: puzzle.id, pubOneId: pubOne.id, pubTwoId: pubTwo.id };
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db, 3);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db, 3);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db, 2);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Game 01');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db, 2);
        expect(await getGameById(db, 99999)).toBeNull();
    });

    it('filters games by one or more categories', async () => {
        const { strategyId, puzzleId } = await seedGamesForFiltering(db);

        const strategyGames = await getAllGames(db, { categoryIds: [strategyId] });
        const multiCategoryGames = await getAllGames(db, { categoryIds: [strategyId, puzzleId] });

        expect(strategyGames.map((game) => game.title)).toEqual(['Alpha Tactics', 'Castle Conquest']);
        expect(multiCategoryGames.map((game) => game.title)).toEqual([
            'Alpha Tactics',
            'Brilliant Maze',
            'Castle Conquest',
            'Zen Logic',
        ]);
    });

    it('filters games by publisher and combines with category filtering', async () => {
        const { strategyId, pubOneId, pubTwoId } = await seedGamesForFiltering(db);

        const publisherGames = await getAllGames(db, { publisherId: pubOneId });
        const combinedGames = await getAllGames(db, { categoryIds: [strategyId], publisherId: pubTwoId });

        expect(publisherGames.map((game) => game.title)).toEqual(['Alpha Tactics', 'Zen Logic']);
        expect(combinedGames.map((game) => game.title)).toEqual(['Castle Conquest']);
        expect(combinedGames.every((game) => game.category?.id === strategyId && game.publisher?.id === pubTwoId)).toBe(true);
    });

    it('returns all categories and publishers in display order', async () => {
        await seedGamesForFiltering(db);

        expect(await getAllCategories(db)).toEqual([
            { id: expect.any(Number), name: 'Puzzle' },
            { id: expect.any(Number), name: 'Strategy' },
        ]);
        expect(await getAllPublishers(db)).toEqual([
            { id: expect.any(Number), name: 'Pub One' },
            { id: expect.any(Number), name: 'Pub Two' },
        ]);
    });
});
