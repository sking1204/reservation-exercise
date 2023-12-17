/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    // console.log(results)

 //for each row (referenced by c which includes id, firstName,lastName,phone,notes),
 // we want to map that into a new Customer object
  //and then we want to return the results which is an an array of those customer objects
   //long version:
    // let res = results.rows.map(c => new Customer(c));
    // console.log(res)
    // return(res)

    //short version:
     return results.rows.map(c => new Customer(c));
  } 
   


    
  /** get a customer by Name. */
  // static async getByName(firstName, lastName) {
  //   const results = await db.query(
  //     `SELECT id, 
  //        first_name AS "firstName",  
  //        last_name AS "lastName", 
  //        phone, 
  //        notes 
  //      FROM customers 
  //      WHERE first_name = $1 AND last_name = $2`,
  //     [firstName, lastName]
  //   );

  //   const customer = results.rows[0];

  //   if (customer === undefined) {
  //     const err = new Error(`No such customer: ${firstName} ${lastName}`);
  //     err.status = 404;
  //     throw err;
  //   }

  //   return new Customer(customer);
  // }

    
  
  /** Search customers */

    static async search(firstName, lastName) {
      const results = await db.query(
        `SELECT id, 
           first_name AS "firstName",  
           last_name AS "lastName", 
           phone, 
           notes
         FROM customers
         WHERE first_name = $1 AND last_name = $2`,
        [firstName, lastName]
      );
      return results.rows.map((c) => new Customer(c));
    }










  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];
    // console.log(customer)

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }


  /* Get top 10 best customers */
  //FIRST ATTEMPT
  // static async getBestCustomers() {
  //   const results = await db.query(
  //     `SELECT customer_id, COUNT(customer_id) AS total_reservations
  //     FROM reservations
  //     GROUP BY customer_id
  //     ORDER BY total_reservations DESC 
  //     LIMIT 10;`
  //   );
  //   return results.rows.map(async(r)=>{
  //       const customer = await this.get(r.customer_id)
  //       return {customer, reservations:r.total}
  //     })   

  //   }


  /* Get top 10 best customers */
  //SECOND ATTEMPT:

  static async getBestCustomers() {
    const results = await db.query(`
      SELECT c.id, c.first_name, COUNT(r.customer_id) AS total_reservations
      FROM customers c
      JOIN reservations r ON c.id = r.customer_id
      GROUP BY c.id
      ORDER BY total_reservations DESC 
      LIMIT 10;
    `);
  
    const customerResults = results.rows.map(async (r) => {
      const customer = await this.get(r.id);
      let res= { customer, reservations: r.total_reservations };
      console.log(res)
      return res
    });
  
    return Promise.all(customerResults);
  }
  

  /* property to get full name.... review !!! */
  get fullName(){
   let res= `${this.firstName} ${this.lastName}`;
  //  console.log(res)
  return res;
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}

module.exports = Customer;
