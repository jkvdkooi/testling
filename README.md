# Testling

**Synthetic Dutch test identity generator for education and EdTech applications — for testing purposes only.**

> ⚠️ **For testing purposes only.** All generated identities are entirely fictional. Never use this data in production systems or represent it as real personal data.

> *Documentation is in Dutch. The project tagline is in English for discoverability.*

---

## Wat doet het?

Testling genereert realistische maar volledig fictieve testpersonen voor PO- en VO-aanmeldingen. Ontwikkeld vanuit de context van [Leerlinq](https://leerlinq.nu), maar bruikbaar voor elke onderwijs- of EdTech-toepassing waarbij je realistische testdata nodig hebt. Alle gegevens zijn synthetisch — geen echte personen.

---

## Functionaliteiten

### BSN — correcte ELF-proef

De officiële BSN-formule:

```
9×d1 + 8×d2 + 7×d3 + 6×d4 + 5×d5 + 4×d6 + 3×d7 + 2×d8 − 1×d9 ≡ 0 (mod 11)
```

Het laatste cijfer telt **negatief** mee. Een veelgemaakte fout is alle gewichten positief te rekenen — dat levert BSN's op die de ELF-proef niet doorstaan. BSN's beginnen altijd met een cijfer 1–9.

### IBAN — ELF-proef + MOD-97

Elke ouder/verzorger krijgt een geldig Nederlands IBAN. De generator doorloopt twee validatielagen:

**1. ELF-proef (MOD-11) op het rekeningnummer (BBAN)**

```
10×d1 + 9×d2 + 8×d3 + … + 1×d10 ≡ 0 (mod 11)
```

**2. MOD-97 op de IBAN-controlecijfers (ISO 7064)**

```
BBAN + "NL00" → letters vervangen door cijfers → mod 97 → 98 − rest = controlecijfers
```

Ondersteunde banken: ABN AMRO, ING, Rabobank, SNS Bank, ASN Bank, RegioBank, Triodos Bank, Bunq, Knab, Van Lanschot Kempen, Nationale Nederlanden Bank, Handelsbanken.

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
Genereer een enkelvoudige ouderidentiteit, los van een kind. Inclusief IBAN en bank.

### Volledig gezin
Genereer een coherent gezin: kind + 1 of 2 ouders/voogden. Adres wordt gedeeld. Emailadressen zijn gekoppeld via het plus-adres schema. Beide ouders krijgen elk een eigen IBAN.

---

## Kopiëren

Elk veld heeft een **kopieer**-knop. Bij succes wordt de knop groen met ✓ ok.
Werkt via `navigator.clipboard` met `execCommand` als fallback (voor gebruik in Cowork/iframe-omgevingen).

De **JSON**-knop toont de volledige identiteit als JSON-object — handig voor Postman of testscripts.

---

## Veldoverzicht per identiteit

| Veld | Aanwezig bij | Toelichting |
|---|---|---|
| Voornaam | Kind, Ouder | Willekeurig Nederlandse naam |
| Tussenvoegsel | Kind, Ouder | Bijv. `van den`, `de`, of leeg |
| Achternaam | Kind, Ouder | Gekoppeld aan tussenvoegsel |
| Geslacht | Kind, Ouder | Man / Vrouw |
| Geboortedatum | Kind, Ouder | DD-MM-YYYY, leeftijd passend bij instroom |
| Leeftijd | Kind | Berekend uit geboortedatum |
| BSN | Kind, Ouder | 9 cijfers, ELF-proef gevalideerd, begint met 1–9 |
| IBAN | Ouder | NL IBAN, ELF-proef (BBAN) + MOD-97 gevalideerd |
| Bank | Ouder | Naam van de bank behorend bij het IBAN |
| Telefoon | Kind, Ouder | 10 cijfers, begint met 06, geen koppelteken |
| E-mailadres | Kind, Ouder | Plus-adres gebaseerd op instelbaar basis-emailadres |
| Straat | Kind, Ouder | Echte Nederlandse straatnaam |
| Huisnummer | Kind, Ouder | Getal + optionele letter (bijv. 42B) |
| Postcode | Kind, Ouder | PC6: 4 cijfers + spatie + 2 letters |
| Woonplaats | Kind, Ouder | Gekoppeld aan postcode |
| Provincie | Kind, Ouder | Gekoppeld aan woonplaats |
| Relatie | Ouder | Ouder, Verzorger of Voogd |
| Groep | Kind (PO) | Groep 1–8, passend bij leeftijd |
| Klas | Kind (VO) | 1e–6e klas, passend bij leeftijd |
| Niveau | Kind (VO) | VMBO-T, VMBO-KB, HAVO, VWO of VMBO-GL |

---

## Unit tests

Testling heeft een browser-native testsuite zonder npm of build-stap. Start de dev server en open:

```
http://localhost:3001/tests/
```

De suite dekt BSN (ELF-proef, entropie) en IBAN (ELF-proef op BBAN, MOD-97, kansverdeling banken) — 24 tests in totaal.

---

## Lokaal draaien

```bash
python3 dev.py
```

Opent op `http://localhost:3001`. De server stuurt `no-cache` headers mee zodat code-wijzigingen altijd direct zichtbaar zijn zonder hard refresh.

---

## Bekende beperkingen

- Adressen zijn **subjectief realistisch** — de combinatie van straatnaam, huisnummer en PC6-letters is niet gegarandeerd een bestaand adres in de BAG.
- BSN's zijn **wiskundig geldig** maar nooit gekoppeld aan echte personen in de BRP.
- IBAN's zijn **wiskundig geldig** (ELF-proef + MOD-97) maar nooit gekoppeld aan echte rekeningen.
- Gegenereerde identiteiten zijn uitsluitend bedoeld voor **testdoeleinden** in een afgeschermde testomgeving.

---

## Licentie

Copyright 2026 Janko van der Kooi — Apache License 2.0. Zie [LICENSE](LICENSE).
