const { EntityProducts, CharacteristicsProducts, EntityDiscounts, EntityReview, EntityUsers } = require('../../../db.js');
const { Op } = require('sequelize');

const filtersProducts = async (properties, limit, offset, order) => {
    const { category, brand, name, price, year, priceMin, priceMax } = properties;
    const where = {};
    // Construye las condiciones de filtrado basadas en los parámetros de consulta.

    let include =  [ 
        {
            model: CharacteristicsProducts,
            where: {},
            attributes: ['idCharacteristicsProducts', 'modelProduct', 'characteristics', 'idBrand']
        },{
            model: EntityReview,
            attributes: ['descriptionReview','idReview'],
            include: [
                {
                    model: EntityUsers,
                    attributes: ['emailUser']
                }
            ]
        },
        {
            model: EntityDiscounts,
            attributes: ['nameDiscount', 'descriptionDiscount', 'quantity', 'activeDiscount', 'idProduct', 'discountInGroup' ],
        }
    ];
    
    if (name) {
        where.nameProduct = { [Op.iLike]: `%${name}%` };
    }
    if (price) {
        where.priceProduct = price;
    }
    if (year) {
        where.yearProduct = year;
    }
    if ( priceMin || priceMax ) {
        if( priceMin && priceMax ){
            where.priceProduct = {
                [Op.and]: [
                    { [Op.gte]: priceMin },
                    { [Op.lte]: priceMax }
                ]
            };
        }
        else if (priceMin) {
            where.priceProduct = {[ Op.gte ] : priceMin}; // Mayor o igual que priceMin
        }
        else{
            where.priceProduct= {[ Op.lte ] : priceMax}; // Menor o igual que priceMax
        }
    }

    if(category) {
        where.idCategory = category
    }
    if(brand) {
        const brandIds = brand.split(',').map(brandId => parseInt(brandId)); 
        include[0].where.idBrand = {[Op.in]: brandIds};
    }

    const resultFilters = await EntityProducts.findAndCountAll({
        where,
        limit,
        offset,
        include,
        order
    });
    return resultFilters;
};
module.exports = {
    filtersProducts
}