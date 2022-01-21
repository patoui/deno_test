import { client } from "../database/db.ts";
import {
  Listing,
  ListingRepositoryInterface,
  NewListing,
  PaginatedListingListInterface,
  PaginatedListingListRepositoryInterface,
} from "../../domain/listing.ts";
import PaginatedListingList from "./value_objects/paginated_listing_list.ts";

export default class ListingRepository
  implements
    ListingRepositoryInterface,
    PaginatedListingListRepositoryInterface {
  doesListingExists = async (
    address: string,
    postal_code: string,
    city: string,
    province: string,
    country: string,
    address_2: string | null,
  ): Promise<boolean> => {
    const bindings = [address, postal_code, city, province, country];
    let sql = `SELECT FROM listings
                    WHERE address = $1
                        AND postal_code = $2
                        AND city = $3
                        AND province = $4
                        AND country = $5`;

    if (address_2) {
      sql += " AND address_2 = $6";
      bindings.push(address_2);
    }

    const listingExists = await client.queryArray(
      `SELECT EXISTS(${sql} LIMIT 1);`,
      bindings,
    );

    return Boolean(listingExists.rows[0][0] ?? false).valueOf();
  };

  createListing = async (newListing: NewListing): Promise<boolean> => {
    await client.queryArray(
      `INSERT INTO listings (
                user_id,
                mls_number,
                price,
                name,
                description,
                address,
                address_2,
                postal_code,
                city,
                province,
                country,
                bedrooms,
                bathrooms,
                property_type,
                house_type,
                stories,
                title,
                build_year,
                parking_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        newListing.user_id,
        newListing.mls_number,
        newListing.price,
        newListing.name,
        newListing.description,
        newListing.address,
        newListing.address_2,
        newListing.postal_code,
        newListing.city,
        newListing.province,
        newListing.country,
        newListing.bedrooms,
        newListing.bathrooms,
        newListing.property_type,
        newListing.house_type,
        newListing.stories,
        newListing.title,
        newListing.build_year,
        newListing.parking_type,
      ],
    );

    return true;
  };

  getPaginatedListings = async (
    page = 1,
    perPage = 15,
  ): Promise<PaginatedListingListInterface> => {
    const listingCount = (await client.queryArray("SELECT COUNT(*) FROM listings")).rows[0][0] ?? 0;

    const listings = (await client.queryObject<Listing>(
      "SELECT * FROM listings ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [perPage, perPage * page],
    )).rows;

    const paginatedListingList = new PaginatedListingList(
      page,
      perPage,
      typeof listingCount === 'string' ? Number.parseInt(listingCount) : 0,
      listings
    );

    return paginatedListingList;
  };
}