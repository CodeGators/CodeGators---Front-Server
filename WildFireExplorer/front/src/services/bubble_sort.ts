export class Sort<T> {
  bubbleSort(arr: T[], key: keyof T): T[] {
    const n = arr.length;
    const result = [...arr]; // cópia para não alterar original

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Troca se o valor atual for MENOR que o próximo para ordem decrescente
        if (Number(result[j][key]) < Number(result[j + 1][key])) {
          const temp = result[j];
          result[j] = result[j + 1];
          result[j + 1] = temp;
        }
      }
    }

    return result;
  }
}
