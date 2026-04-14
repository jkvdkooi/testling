# Testling

**Dutch test identity generator for EdTech SaaS applications.**

Generated identities are synthetic and intended for testing purposes only.
Do not use in production systems or misrepresent as real personal data.

> *Documentation is in Dutch. The project tagline is in English for discoverability.*

---

## Wat doet het?

Testling genereert realistische maar volledig fictieve testpersonen voor PO- en VO-aanmeldingen, specifiek voor gebruik bij het testen van [Leerlinq](https://leerlinq.nu). Alle gegevens zijn synthetisch — geen echte personen.

---

## Functionaliteiten

### BSN — correcte ELF-proef

De officiële BSN-formule:

```
9×d1 + 8×d2 + 7×d3 + 6×d4 + 5×d5 + 4×d6 + 3×d7 + 2×d8 − 1×d9 ≡ 0 (mod 11)
```

Het laatste cijfer telt **negatief** mee. Een veelgemaakte fout is alle gewichten positief te rekenen — dat levert BSN's op die de ELF-proef niet doorstaan.

### Postcode — PC6

PC6 = 4 cijfers + spatie + 2 letters. Bijvoorbeeld: `9203 BK` of `8441 TN`.

De cijfers zijn gekoppeld aan echte PC4-reeksen per stad (Drachten = 9203, Groningen = 9712, etc.). De lettercombinaties `SS`, `SA`, `SD` en `SF` zijn uitgesloten — die zijn gereserveerd door PostNL.

### Telefoonnummer

Format: 10 cijfers zonder koppelteken, altijd beginnend met `06`. Bijvoorbeeld: `0612345678`.

### E-mailadressen — plus-adres schema

Het basis-emailadres is **instelbaar door de gebruiker**. De generator bouwt vanuit dat adres automatisch plus-tags op per persoon en rol. Voorbeeld met `jouw-adres@outlook.com` als basis:

| Persoon | Emailadres |
|---|---|
| Kind (PO, onderinstroom) | `jouw-adres+emma.po.onder@outlook.com` |
| Kind (VO, zij-instroom) | `jouw-adres+noah.vo.zij@outlook.com` |
| Ouder van Emma (PO) | `jouw-adres+ouder.emma.po.onder@outlook.com` |
| Tweede ouder van Emma | `jouw-adres+ouder2.emma.po.onder@outlook.com` |

Alle mail komt binnen op het basis-adres. De plus-tag zorgt voor onderscheid per persoon en instroom.

### Instroom

| Type | PO | VO |
|---|---|---|
| **Onderinstroom** | 4 jaar, Groep 1 | 12 jaar, 1e klas (brugklas) |
| **Zij-instroom** | 4–12 jaar, groep berekend op leeftijd | 12–18 jaar, klas berekend op leeftijd |

### Biologische koppeling (gezin-tab)

| Instelling | Kind | Ouder 1 | Ouder 2 |
|---|---|---|---|
| Biologisch (standaard) | Achternaam van ouder 1 | Zelfde achternaam als kind | Eigen achternaam |
| Niet-biologisch | Eigen achternaam | Eigen achternaam | Eigen achternaam |

Tussenvoegsel wordt altijd exact meegenomen — `van den Berg` blijft `van den Berg` bij kind én ouder.

---

## Tabs

### Kind
Genereer een enkelvoudige leerlingidentiteit. Kies schooltype (PO/VO) en instroomtype.

### Ouder / verzorger
Genereer een enkelvoudige ouderidentiteit, los van een kind.

### Volledig gezin
Genereer een coherent gezin: kind + 1 of 2 ouders/voogden. Adres wordt gedeeld. Emailadressen zijn gekoppeld via het plus-adres schema.

---

## Kopiëren

Elk veld heeft een **kopieer**-knop. Bij succes wordt de knop groen met ✓ ok.
Werkt via `navigator.clipboard` met `execCommand` als fallback (voor gebruik in Cowork/iframe-omgevingen).

De **JSON**-knop toont de volledige identiteit als JSON-object — handig voor Postman of testscripts.

---

## Veldoverzicht per identiteit

| Veld | Toelichting |
|---|---|
| Voornaam | Willekeurig Nederlandse naam |
| Tussenvoegsel | Bijv. `van den`, `de`, of leeg |
| Achternaam | Gekoppeld aan tussenvoegsel |
| Geslacht | Man / Vrouw |
| Geboortedatum | DD-MM-YYYY, leeftijd passend bij instroom |
| Leeftijd | Berekend uit geboortedatum |
| BSN | 9 cijfers, ELF-proef gevalideerd |
| Telefoon | 10 cijfers, begint met 06, geen koppelteken |
| E-mailadres | Plus-adres gebaseerd op instelbaar basis-emailadres |
| Straat | Echte Nederlandse straatnaam |
| Huisnummer | Getal + optionele letter (bijv. 42B) |
| Postcode | PC6: 4 cijfers + spatie + 2 letters |
| Woonplaats | Gekoppeld aan postcode |
| Provincie | Gekoppeld aan woonplaats |
| Groep (PO) | Groep 1–8, passend bij leeftijd |
| Klas (VO) | 1e–6e klas, passend bij leeftijd |
| Niveau (VO) | VMBO-T, VMBO-KB, HAVO, VWO of VMBO-GL |
| Relatie (ouder) | Ouder, Verzorger of Voogd |

---

## Bekende beperkingen

- Adressen zijn **subjectief realistisch** — de combinatie van straatnaam, huisnummer en PC6-letters is niet gegarandeerd een bestaand adres in de BAG.
- BSN's zijn **wiskundig geldig** maar nooit gekoppeld aan echte personen in de BRP.
- Gegenereerde identiteiten zijn uitsluitend bedoeld voor **testdoeleinden** in een afgeschermde testomgeving.

---

## Licentie

Copyright 2026 Janko van der Kooi — Apache License 2.0. Zie [LICENSE](LICENSE).
