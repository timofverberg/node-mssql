
const sql = require('./lib/tedious.js');
const moment = require('moment');

class SqlTable extends sql.Table {
	constructor()
	{
		super();
	}

	addRowSafely(...input)
	{
		for (let loopCounter = 0; loopCounter < input.length; loopCounter++) {

			const parameter = input[loopCounter];
			const column = this.columns[loopCounter];

			if (!column)
			{
				throw new Error('Too many parameters are supplied');
			}

			else if (!column.nullable && (parameter === undefined || parameter === null))
			{
				throw new Error(`Supplied parameter, parameter ${loopCounter}, column ${column.name}, can not be null`);
			}

			// No need to do type checks since parameter is null
			else if (!(column.nullable && !parameter))
			{
				switch(column.type)
				{
					case sql.Bit:
					{
						if (!(parameter === true || parameter === false || parameter === 0 || parameter === 1))
						{
							throw new Error(`Parameter ${loopCounter}, value ${parameter}, column ${column}, can't be converted to bit`);
						}

						break;
					}

					case sql.Int:
					{
						if (!(parseInt(parameter) && parameter >= Math.pow(-2, 31) && parameter <= Math.pow(2, 31)-1))
						{
							throw new Error(`Parameter ${loopCounter}, value ${parameter}, column ${column}, can't be converted to int`);
						}

						break;
					}

					case sql.VarChar:
					{
						if (typeof parameter !== 'string')
						{
							throw new Error(`Parameter ${loopCounter}, value ${parameter}, column ${column}, can't be converted to varchar`);
						}

						else if (parameter.length > column.length)
						{
							throw new Error(`Parameter ${loopCounter}, value ${parameter}, column ${column}, exceeds ${column.length} characters`);
						}

						break;
					}

					case sql.BigInt:
					{
						if (!(parseInt(parameter) && parameter >= Math.pow(-2, 63) && parameter <= Math.pow(2, 63)-1))
						{
							throw new Error(`Parameter ${loopCounter}, value ${parameter}, column ${column}, can't be converted to bigint`);
						}

						break;
					}

					case sql.DateTime:
					{
						if (!moment(parameter).isValid())
						{
							throw new Error(`Parameter ${loopCounter}, value ${parameter}, column ${column}, is not a valid date`);
						}

						break;
					}

					default:
					{
						throw new Error(`Type ${column.type} hasn't been added to safe list`);
					}
				}
			}
		}

		this.rows.add(...input);			
	}
}

module.exports = {
	...sql,
	Table: SqlTable
}