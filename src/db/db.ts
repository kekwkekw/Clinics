import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { countDistinct, eq, getTableName, sql, like, count, sum } from 'drizzle-orm';
import Database from 'better-sqlite3';
import { Cities, Clinics, Suburbs } from './schema';
import {filterBlankKeysDicts} from '../utils/utils';
import { get } from 'http';

class DB {
    private db: BetterSQLite3Database;
    private tables: Record<string, SQLiteTable>

    constructor(dbPath: string) {
        this.db = drizzle(new Database(dbPath));
        this.tables = {
            Cities,
            Clinics,
            Suburbs
        };
    }

    public getTable(tableName: string): SQLiteTable {
        return this.tables[tableName];
    }

    private async insertDataFromFile(table: SQLiteTable, fileName: string): Promise<void> {
        const filePath = path.join(__dirname, 'rawData', fileName);
        const data: any[] = [];

        return new Promise<void>((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser({ separator: ',' }))
                .on('data', (row: any[] = []) => {
                    if (row.length === 0) return;
                    data.push(row);
                })
                .on('end', async () => {
                    try {
                        const filteredData = filterBlankKeysDicts(data);
                        const entriesN = filteredData.length*(filteredData[0].length || 1);
                        for (let i=0; i < entriesN; i+=999) {
                            const slice = filteredData.slice(i, i+999);
                            await this.db.insert(table).values(slice);
                        }
                        console.log(`Data from file ${fileName} inserted to table ${getTableName(table)}`);
                        resolve();
                    }
                    catch (err) {
                        console.log(err)
                        reject(err);
                    }
                });
        });
    }

    public async fillTables(): Promise<void> {
        const tablePromisesDelete = Object.entries(this.tables).map(([tableName, table]) =>
            this.db.delete(table)
        );
        await Promise.all(tablePromisesDelete);
        console.log('Tables cleared');

        const tablePromises = Object.entries(this.tables).map(([tableName, table]) =>
            this.insertDataFromFile(table, `${tableName.toLowerCase()}.csv`)
        );
        await Promise.all(tablePromises);
        console.log('Tables filled');
    }

    public async searchClinicsByCity(city: string): Promise<any[]> {
        const clinics = await this.db.select().from(Clinics).where(like(Clinics.City, `%${city}%`));
        return clinics;
    }

    public async searchClinicsBySuburb(suburb: string): Promise<any[]> {
        const clinics = await this.db.select().from(Clinics).where(like(Clinics.Suburb, `%${suburb}%`));
        return clinics;
    }

    public async searchClinicsByState(state: string): Promise<any[]> {
        const clinics = await this.db.select().from(Clinics).where(eq(Clinics.State, state));
        return clinics;
    }

    public async searchClinicsByPostcode(postcode: string): Promise<any[]> {
        const clinics = await this.db.select().from(Clinics).where(eq(Clinics.Postcode, postcode));
        return clinics;
    }

    public async searchClinicsByName(name: string): Promise<any[]> {
        const clinics = await this.db.select().from(Clinics).where(like(Clinics['Long Name Version'], `%${name}%`));
        return clinics;
    }

    public async cityInfo(city_slug: string): Promise<any> {
        const city = await this.db.select().from(Cities).where(eq(Cities.city_slug, city_slug));
        return city;
    }

    public async suburbInfo(suburb_slug: string): Promise<any> {
        const suburb = await this.db.select().from(Suburbs).where(eq(Suburbs.suburb_slug, suburb_slug));
        return suburb;
    }

    public async clinicInfo(slug: string): Promise<any> {
        const clinic = await this.db.select().from(Clinics).where(eq(Clinics.slug, slug));
        return clinic;
    }

    public async slugs(tableName: string): Promise<any[]> {
        const table = this.getTable(tableName)
        const slugField = tableName === 'Cities' ? Cities.city_slug : tableName === 'Suburbs' ? Suburbs.suburb_slug : Clinics.slug;
        const slugs = await this.db.select({slug: slugField}).from(table);
        return slugs;
    }
}

const dbPath = path.join(__dirname, '..', '..', 'db.db');
const db = new DB(dbPath);

// db.fillTables().then(() => {
//     console.log('Database filled');
// }).catch((err) => {
//     console.error(err);
// });

// db.slugs('Clinics').then((clinics) => console.log(clinics));

export {db}
