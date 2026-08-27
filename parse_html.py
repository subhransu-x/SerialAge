import sys
from bs4 import BeautifulSoup

html = open(sys.argv[1], encoding='utf-8').read()
soup = BeautifulSoup(html, 'html.parser')

tables = soup.find_all('table')
with open('york_tables.txt', 'w', encoding='utf-8') as f:
    for i, table in enumerate(tables):
        f.write(f"--- TABLE {i+1} ---\n")
        rows = table.find_all('tr')
        for row in rows:
            cells = [cell.get_text(strip=True) for cell in row.find_all(['th', 'td'])]
            f.write(" | ".join(cells) + "\n")
        f.write("\n")
