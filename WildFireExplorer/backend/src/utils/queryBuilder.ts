// src/utils/queryBuilder.ts

/**
 * Constrói dinamicamente a cláusula WHERE e o array de parâmetros para queries SQL.
 * @param filters Um objeto com os filtros a serem aplicados.
 * @param columnMap Um mapa de chaves do filtro para nomes de colunas no banco de dados.
 * @param dateColumn Uma coluna de data opcional para filtros de mês.
 * @returns Um objeto contendo a string 'WHERE' e o array de 'params'.
 */
interface BuildQueryParamsResult {
    whereClause: string;
    params: (string | number)[];
  }
  
  export function buildQueryParams(
    filters: Record<string, string | undefined>,
    columnMap: Record<string, string>,
    dateColumn?: string
  ): BuildQueryParamsResult {
    const params: (string | number)[] = [];
    const where: string[] = [];
    let paramIndex = 1;
  
    for (const key in filters) {
      const value = filters[key];
      if (value) { // Verifica se o valor do filtro existe
        if (key === 'mes' && dateColumn) {
          params.push(value);
          where.push(`to_char(${dateColumn}::date,'YYYY-MM') = $${paramIndex}`);
        } else if (columnMap[key]) {
          params.push(value);
          where.push(`${columnMap[key]} = $${paramIndex}`);
        }
        paramIndex++;
      }
    }
  
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  
    return { whereClause, params };
  }