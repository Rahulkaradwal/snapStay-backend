class QueryFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  // Filter Query
  // filter() {
  //   const queryObj = { ...this.queryString };

  //   const excludedFields = ['page', 'sort', 'limit', 'fields'];

  //   excludedFields.forEach((el) => delete queryObj[el]);

  //   let queryStr = JSON.stringify(queryObj);

  //   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (val) => `$${val}`);

  //   let filter = JSON.parse(queryStr);
  //   if (filter.status === 'all' || '') {
  //     this.query = this.query.find();
  //   } else {
  //     this.query = this.query.find(filter);
  //   }
  //   return this;
  // }

  // Sort
  sort() {
    if (this.queryString.sort) {
      const field = this.queryString.sort.split('-')[0];
      const order = this.queryString.sort.split('-')[1];

      if (order === 'desc') {
        this.query = this.query.sort(`-${field}`);
      } else {
        this.query = this.query.sort(field);
      }
    } else {
      // Default sort by createdAt in descending order
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Limit Fields
  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Pagination
  page() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (val) => `$${val}`);

    const filter = JSON.parse(queryStr);

    // Check for empty status or status 'all' and remove the filter if found
    if (filter.status === 'all' || filter.status === '') {
      delete filter.status;
    }

    this.query = this.query.find(filter);
    return this;
  }
}

module.exports = QueryFeatures;
