export class Sort<T> {
  quickSort(arr: T[], key: keyof T): T[] {
    // Faz uma cópia do array para não modificar o original
    const result = [...arr];
    
    // Função auxiliar recursiva do Quick Sort
    const sort = (array: T[], left: number, right: number) => {
      if (left >= right) return;

      const pivotIndex = partition(array, left, right);
      sort(array, left, pivotIndex - 1);
      sort(array, pivotIndex + 1, right);
    };

    // Função de partição (escolhe um pivô e rearranja o array)
    const partition = (array: T[], left: number, right: number): number => {
      const pivotValue = Number(array[right][key]); // Pivô é o último elemento
      let i = left - 1;

      for (let j = left; j < right; j++) {
        // Ordem DECRESCENTE (para ordem crescente, troque para `<`)
        if (Number(array[j][key]) > pivotValue) {
          i++;
          [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
        }
      }

      // Coloca o pivô na posição correta
      [array[i + 1], array[right]] = [array[right], array[i + 1]];
      return i + 1;
    };

    sort(result, 0, result.length - 1);
    return result;
  }
}