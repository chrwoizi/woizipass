export function generateRandomPassword(
  length: number,
  includeSpecialCharacters: boolean,
  includeSimilarCharacters: boolean
) {
  let digits = '123456789';
  let upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let lower = 'abcdefghijkmnopqrstuvwxyz';
  let special = ',.;:-+=_#!?';

  if (includeSimilarCharacters) {
    digits += '0';
    upper += 'IO';
    lower += 'l';
    special += '|';
  }

  const characterSets = [digits, upper, lower];
  if (includeSpecialCharacters) characterSets.push(special);

  const characters = characterSets.join('');

  // generate random string of fixed length that may or may not include characters from all sets
  let result = Array(length)
    .fill(characters)
    .map(function (x) {
      return getRandomChar(x);
    })
    .join('');

  // make sure that at least one character of all sets is included
  const resultIndices = Array(length)
    .fill('')
    .map((x, n) => n);
  for (const set of characterSets) {
    // get random index into result string and remove it from the potential indices
    const index = resultIndices
      .splice(Math.floor(Math.random() * resultIndices.length), 1)
      .shift();

    // replace character at random index with a random character of a specific set
    result =
      result.substring(0, index) +
      getRandomChar(set) +
      result.substring(index + 1, characters.length);
  }

  return result;
}

function getRandomChar(s: any): any {
  return s[Math.floor(Math.random() * s.length)];
}
