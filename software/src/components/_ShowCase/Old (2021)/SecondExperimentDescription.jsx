import React from 'react';
import exclamation from '../../assets/images/Piktogramme/Reizend.png';
import acid from '../../assets/images/Piktogramme/Ätzend-Korrosiv.png';
import nature from '../../assets/images/Piktogramme/Umweltschädlich.png';
import system from '../../assets/images/Piktogramme/Systemschaden.png';
import flame from '../../assets/images/Piktogramme/Entzündlich.png';

export default function SeconExperimentDescription () {
    return (
        <div>
            <div className='box'>

                <p className="title has-text-info is-4">Literaturwerte verschiedener Kunststoffe</p>
                <p className="subtitle is-5">Dichte verschiedener Kunststoffe</p>
                <table className="table is-striped">
                    <thead>
                        <tr>
                            <th>Dichte [g/ml]</th>
                            <th>Kurzbezeichnung</th>
                            <th>Kunststoff</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>0,93 - 0,98</td>
                            <td>PE</td>
                            <td>Polyethylen</td>
                        </tr>
                        <tr>
                            <td>1,04 - 1,08</td>
                            <td>PS</td>
                            <td>Polystyrol</td>
                        </tr>
                        <tr>
                            <td>1,12 - 1,15</td>
                            <td>PA</td>
                            <td>Polyamid</td>
                        </tr>
                        <tr>
                            <td>1,16 - 1,20</td>
                            <td>PMMA</td>
                            <td>Polymethylmethacrylat</td>
                        </tr>
                        <tr>
                            <td>1,21 - 1,31</td>
                            <td>PVAL</td>
                            <td>Polyvinylalkohol</td>
                        </tr>
                        <tr>
                            <td>1,38 - 1,41</td>
                            <td>PVC</td>
                            <td>Polyvinylchlorid</td>
                        </tr>
                        <tr>
                            <td>1,38 - 1,41</td>
                            <td>PET</td>
                            <td>Polyethylenterephthalat</td>
                        </tr>
                        <tr>
                            <td>1,18 - 1,20</td>
                            <td>PAN</td>
                            <td>Polyacrylnitril</td>
                        </tr>
                        <tr>
                            <td>2,16 - 2,18</td>
                            <td>PTFE</td>
                            <td>Polytetraflourethylen</td>
                        </tr>
                        <tr>
                            <td>0,90 - 0,95</td>
                            <td>PP</td>
                            <td>Polypropylen</td>
                        </tr>
                        <tr>
                            <td>0,89 - 0,91</td>
                            <td>PB</td>
                            <td>Polybutylen</td>
                        </tr>
                        <tr>
                            <td>1,18 - 1,21</td>
                            <td>PC</td>
                            <td>Polycarbonat</td>
                        </tr>
                    </tbody>
                </table>

                <p className="subtitle is-5">Löslichkeit verschiedener Kunststoffe</p>
                <table className="table">
                    <thead>
                        <tr>
                            <th>In Wasser</th>
                            <th>In Aceton</th>
                            <th>In Ameisensäure</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>PVAL</td>
                            <td>PS</td>
                            <td>PA, PVAL</td>
                        </tr>
                    </tbody>
                </table>

                <p className='subtitle is-5'>Reaktion der Pyrolysegase mit pH-Papier</p>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>pH 0,5 bis pH 2  </th>
                            <th>pH 3 bis pH 7  </th>
                            <th>pH 8 bis pH 9,5  </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>PVC, PTFE</td>
                            <td>PE, PP, PB, PS,<br/>PMMA, PC, PVAL, PET</td>
                            <td>PA, PAN</td>
                        </tr>
                    </tbody>
                </table>

                <p className='subtitle is-5'>Brennverhalten verschiedener Kunststoffe</p>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Brennbarkeit</th>
                            <th>Flamme</th>
                            <th>Kunststoff</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>nicht brennbar</td>
                            <td></td>
                            <td>PTFE</td>
                        </tr>
                        <tr>
                            <td>schwer entzündbar,<br/>erlischt außerhalb der Flamme</td>
                            <td>grüner Saum</td>
                            <td>PVC</td>
                        </tr>
                        <tr>
                            <td>brennt in der Flamme,<br/>erlischt außerhalb</td>
                            <td>leuchtend, rußend, gelb- grauer Rauch<br/>
                            gelborange blauer Rauch</td>
                            <td>PC<br/>
                            PA</td>
                        </tr>
                        <tr>
                            <td>brennt in der Flamme,<br/>
                            erlischt außerhalb langsam oder nicht</td>
                            <td>leuchtend, Zersetzung<br/>
                            gelborange, rußend<br/>
                            gelb, blauer Kern</td>
                            <td>PVAL<br/>
                            PET<br/>
                            PE, PP, PB</td>
                        </tr>
                        <tr>
                            <td>leicht entzündbar,<br/>brennt außerhalb der Flamme weiter</td>
                            <td>leuchtend, sehr stark rußend, leuchtend blauer Kern, knisternd</td>
                            <td>PS, PMMA, PAN</td>
                        </tr>
                    </tbody>
                </table>

            </div>
            <div className="box">
                <p className="title has-text-info is-4">Gefahrenhinweise verschiedener Chemikalien</p>

                <table className="table is-bordered">
                    <tbody>
                        <tr>
                            <td>
                                <p className="block">Adipinsäuredichlorid</p>
                                <figure className="is-flex is-flex-direction-row block">
                                    <img className="image is-64x64" src={acid}></img>
                                </figure>
                                <strong className="block">Gefahr</strong>
                            </td>
                            <td>
                                <p className="block">Gefahrenhinweise</p>
                                <div className="columns block is-multiline pb-3">
                                    <p className="column py-1 is-2">H314</p>
                                    <p className="column py-1 is-10">Verursacht schwere Verätzungen der Haut und schwere Augenschäden.</p>
                                    <p className="column py-1 is-2">EUH014</p>
                                    <p className="column py-1 is-10">Reagiert heftig mit Wasser.</p>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p className="block">Hexamethylendiamin</p>
                                <figure className="is-flex is-flex-direction-row block">
                                    <img className="image is-64x64" src={acid}></img>
                                    <img className="image is-64x64" src={exclamation}></img>
                                </figure>
                                <strong className="block">Gefahr</strong>
                            </td>
                            <td>
                                <p className="block">Gefahrenhinweise</p>
                                <div className="columns block is-multiline pb-3">
                                    <span className="column py-1 is-2">H302</span>
                                    <span className="column py-1 is-10">Gesundheitsschädlich bei Verschlucken.</span>
                                    <span className="column py-1 is-2">H312</span>
                                    <span className="column py-1 is-10">Gesundheitsschädlich bei Hautkontakt.</span>
                                    <span className="column py-1 is-2">H314</span>
                                    <span className="column py-1 is-10">Verursacht schwere Verätzungen der Haut und schwere Augenschäden.</span>
                                    <span className="column py-1 is-2">H335</span>
                                    <span className="column py-1 is-10">Kann die Atemwege reizen.</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p className="block"><em>n</em>-Heptan</p>
                                <figure className="is-flex is-flex-direction-row block">
                                    <img className="image is-64x64" src={nature}></img>
                                </figure>
                                <strong className="block">Gefahr</strong>
                            </td>
                            <td>
                                <p className="block">Gefahrenhinweise</p>
                                <div className="columns block is-multiline pb-3">
                                    <span className="column py-1 is-2">H225</span>
                                    <span className="column py-1 is-10">Flüssigkeit und Dampf leicht entzündbar.</span>
                                    <span className="column py-1 is-2">H304</span>
                                    <span className="column py-1 is-10">Kann bei Verschlucken und Eindringen in die Atemwege tödlich sein.</span>
                                    <span className="column py-1 is-2">H315</span>
                                    <span className="column py-1 is-10">Verursacht Hautreizungen.</span>
                                    <span className="column py-1 is-2">H336</span>
                                    <span className="column py-1 is-10">Kann Schläfrigkeit und Benommenheit verursachen.</span>
                                    <span className="column py-1 is-2">H410</span>
                                    <span className="column py-1 is-10">Sehr giftig für Wasserorganismen mit langfristiger Wirkung.</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p className="block">Natriumcarbonat</p>
                                <figure className="is-flex is-flex-direction-row block">
                                    <img className="image is-64x64" src={exclamation}></img>
                                </figure>
                                <strong className="block">Achtung</strong>
                            </td>
                            <td>
                                <p className="block">Gefahrenhinweise</p>
                                <div className="columns block is-multiline pb-3">
                                    <span className="column py-1 is-2">H319</span>
                                    <span className="column py-1 is-10">Verursacht schwere Augenreizung.</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p className="block">Aceton</p>
                                <figure className="is-flex is-flex-direction-row block">
                                    <img className="image is-64x64" src={flame}></img>
                                    <img className="image is-64x64" src={exclamation}></img>
                                </figure>
                                <strong className="block">Gefahr</strong>
                            </td>
                            <td>
                                <p className="block">Gefahrenhinweise</p>
                                <div className="columns block is-multiline pb-3">
                                    <span className="column py-1 is-2">H225</span>
                                    <span className="column py-1 is-10">Flüssigkeit und Dampf leicht entzündbar.</span>
                                    <span className="column py-1 is-2">H319</span>
                                    <span className="column py-1 is-10">Verursacht schwere Augenreizung.</span>
                                    <span className="column py-1 is-2">H336</span>
                                    <span className="column py-1 is-10">Kann Schläfrigkeit und Benommenheit verursachen.</span>
                                    <span className="column py-1 is-2">EUH066</span>
                                    <span className="column py-1 is-10">Wiederholter Kontakt kann zu spröder oder rissiger Haut führen.</span>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p className="block">Ethanol/Wasser 75% (w/w)</p>
                                <figure className="is-flex is-flex-direction-row block">
                                    <img className="image is-64x64" src={flame}></img>
                                    <img className="image is-64x64" src={exclamation}></img>
                                </figure>
                                <strong className="block">Gefahr</strong>
                            </td>
                            <td>
                                <p className="block">Gefahrenhinweise</p>
                                <div className="columns block is-multiline pb-3">
                                    <span className="column py-1 is-2">H225</span>
                                    <span className="column py-1 is-10">Flüssigkeit und Dampf leicht entzündbar.</span>
                                    <span className="column py-1 is-2">H319</span>
                                    <span className="column py-1 is-10">Verursacht schwere Augenreizung.</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    );
}

export function ExperimentScriptA2 () {
    return (
        <div className='section' id='page-content'>
            <div className='columns'>

                <div className='column is-flexible'>

                    <div className='box mb-7 pb-7'>
                        <h3 className='is-size-2 title has-text-info'>A.2. Herstellung von Nylon durch Grenzflächenkondensation</h3>
                        <h3 className='is-size-5 subtitle has-text-grey-light'>Dauer: 20 Min.</h3>
                    </div>

                    <div className='box' id='Material'>
                        <h3 className='is-size-4 title has-text-info'>Material</h3>
                        <div className='is-flex is-flex-direction-column'>
                            <label className='mx-5'>Becherglas 50ml, 250ml</label>
                            <label className='mx-5'>2 Messzylinder 25ml</label>
                            <label className='mx-5'>Einwegpipetten</label>
                            <label className='mx-5'>Holzstab</label>
                            <label className='mx-5'>Pinzette</label>
                        </div>
                    </div>

                    <div className='box mb-7 pb-7' id='Chemikalien'>

                        <h3 className='is-size-4 title has-text-info'>Chemikalien</h3>

                        <div className='mx-5'>
                            <div className='columns block is-align-items-center'>
                                <label className='column'>Adipinsäuredichlorid</label>
                                <figure className='column'>
                                    <img className='image is-48x48' src={acid} />
                                </figure>
                                <strong className='column'>Gefahr</strong>
                                <div className='column is-one-fifth'></div>
                            </div>
                            <div className='columns is-align-items-center'>
                                <label className='column'>Hexamethylendiamin</label>
                                <figure className='column is-flex is-flex-direction-row'>
                                    <img className='image is-48x48' src={acid} />
                                    <img className='image is-48x48' src={exclamation} />
                                </figure>
                                <strong className='column'>Gefahr</strong>
                                <div className='column is-one-fifth'></div>
                            </div>
                            <div className='columns is-align-items-center'>
                                <label className='column'><em>n</em>-Heptan</label>
                                <figure className='column is-flex is-flex-direction-row'>
                                    <img className='image is-48x48' src={flame} />
                                    <img className='image is-48x48' src={system} />
                                    <img className='image is-48x48' src={exclamation} />
                                    <img className='image is-48x48' src={nature} />
                                </figure>
                                <strong className='column'>Gefahr</strong>
                                <div className='column is-one-fifth'></div>
                            </div>
                            <div className='columns is-align-items-center'>
                                <label className='column'>Natriumcarbonat</label>
                                <figure className='column is-flex is-flex-direction-row'>
                                    <img className='image is-48x48' src={exclamation} />
                                </figure>
                                <strong className='column'>Achtung</strong>
                                <div className='column is-one-fifth'></div>
                            </div>
                            <div className='is-align-items-center'>
                                <label>VE-Wasser</label>
                            </div>
                        </div>
                    </div>

                    <div className='box' id='Durchführung'>
                        <h3 className='is-size-4 title has-text-info'>Durchführung</h3>

                        <p className='box has-background-danger-light'>
                            <span className='tag is-danger has-text-weight-bold is-medium'>Sicherheit:</span>

                            <div>
                                <label>Schutzbrille, Handschuhe tragen!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>
                            <div>
                                <label>Unter dem Abzug arbeiten!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>
                        </p>

                        <div className='box'>
                            <span className='has-text-weight-bold'>1. Lösung 1: </span>
                            Löse im 50-ml-Becherglas 0,5 ml Adipinsäuredichlorid in 12 ml <em>n</em>-Heptan.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>2. Lösung 2: </span>
                            Löse im 250-ml-Becherglas 0,5 g Natriumcarbonat und 0,5 g Hexamethylendiamin (eventuell vorher in einem heißen Wasserbad schmelzen, Schmelzpunkt 45 °C) in 12 ml Wasser.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>3. </span>
                            Überschichte Lösung 2 im 250-ml-Becherglas vorsichtig mit Lösung 1. An der Phasengrenze der beiden Flüssigkeiten bildet sich eine dünne weiße Schicht.<br/><br/>
                            <span className='has-text-danger has-text-weight-bold'>Achte darauf, dass du hinter der Abzugsscheibe arbeitest (Spritzgefahr!).</span><br/><br/>
                            Ziehe mit der Pinzette aus der Mitte der weißen Schicht einen Nylonfaden. Spule den Faden gleichmäßig und vorsichtig auf dem Holzstab auf.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>

                        <div className='box has-background-info-light'>
                            <span className='tag is-info has-text-weight-bold is-medium'>Entsorgung: </span><br/>
                            Wenn du den Versuch beendest hast, rühre das restliche Reaktionsgemisch <span className='has-text-weight-bold'>mit dem Holzstab</span> gut um, bis die Lösungen vollständig abreagiert haben. Entsorge dann die Lösung in dem bereitgestellten Kanister und gib den Feststoff in den Tischabfallbehälter. <span className='has-text-weight-bold'>Die 250-ml-Bechergläser sammeln wir in einem Abzug.</span>
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                    </div>

                    <div className="box">
                        <p className="title has-text-info is-4">Mögliche Gefahren</p>

                        <table className="table is-bordered">
                            <tbody>
                                <tr>
                                    <td>
                                        <p className="block">Adipinsäuredichlorid</p>
                                        <figure className="is-flex is-flex-direction-row block">
                                            <img className="image is-64x64" src={acid}></img>
                                        </figure>
                                        <strong className="block">Gefahr</strong>
                                    </td>
                                    <td>
                                        <p className="block">Gefahrenhinweise</p>
                                        <div className="columns block is-multiline pb-3">
                                            <p className="column py-1 is-2">H314</p>
                                            <p className="column py-1 is-10">Verursacht schwere Verätzungen der Haut und schwere Augenschäden.</p>
                                            <p className="column py-1 is-2">EUH014</p>
                                            <p className="column py-1 is-10">Reagiert heftig mit Wasser.</p>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p className="block">Hexamethylendiamin</p>
                                        <figure className="is-flex is-flex-direction-row block">
                                            <img className="image is-64x64" src={acid}></img>
                                            <img className="image is-64x64" src={exclamation}></img>
                                        </figure>
                                        <strong className="block">Gefahr</strong>
                                    </td>
                                    <td>
                                        <p className="block">Gefahrenhinweise</p>
                                        <div className="columns block is-multiline pb-3">
                                            <span className="column py-1 is-2">H302</span>
                                            <span className="column py-1 is-10">Gesundheitsschädlich bei Verschlucken.</span>
                                            <span className="column py-1 is-2">H312</span>
                                            <span className="column py-1 is-10">Gesundheitsschädlich bei Hautkontakt.</span>
                                            <span className="column py-1 is-2">H314</span>
                                            <span className="column py-1 is-10">Verursacht schwere Verätzungen der Haut und schwere Augenschäden.</span>
                                            <span className="column py-1 is-2">H335</span>
                                            <span className="column py-1 is-10">Kann die Atemwege reizen.</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p className="block"><em>n</em>-Heptan</p>
                                        <figure className="is-flex is-flex-direction-row block">
                                            <img className="image is-64x64" src={nature}></img>
                                        </figure>
                                        <strong className="block">Gefahr</strong>
                                    </td>
                                    <td>
                                        <p className="block">Gefahrenhinweise</p>
                                        <div className="columns block is-multiline pb-3">
                                            <span className="column py-1 is-2">H225</span>
                                            <span className="column py-1 is-10">Flüssigkeit und Dampf leicht entzündbar.</span>
                                            <span className="column py-1 is-2">H304</span>
                                            <span className="column py-1 is-10">Kann bei Verschlucken und Eindringen in die Atemwege tödlich sein.</span>
                                            <span className="column py-1 is-2">H315</span>
                                            <span className="column py-1 is-10">Verursacht Hautreizungen.</span>
                                            <span className="column py-1 is-2">H336</span>
                                            <span className="column py-1 is-10">Kann Schläfrigkeit und Benommenheit verursachen.</span>
                                            <span className="column py-1 is-2">H410</span>
                                            <span className="column py-1 is-10">Sehr giftig für Wasserorganismen mit langfristiger Wirkung.</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p className="block">Natriumcarbonat</p>
                                        <figure className="is-flex is-flex-direction-row block">
                                            <img className="image is-64x64" src={exclamation}></img>
                                        </figure>
                                        <strong className="block">Achtung</strong>
                                    </td>
                                    <td>
                                        <p className="block">Gefahrenhinweise</p>
                                        <div className="columns block is-multiline pb-3">
                                            <span className="column py-1 is-2">H319</span>
                                            <span className="column py-1 is-10">Verursacht schwere Augenreizung.</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>

            </div>
        </div>
    );
}

export function ExperimentScriptB1 () {
    return (
        <div className='section' id='page-content'>
            <div className='columns'>

                <div className='column is-flexible'>

                    <div className='box mb-7 pb-7'>
                        <h3 className='is-size-2 title has-text-info'>B.1. Löslichkeit unbekannter Kunststoffe</h3>
                        <h3 className='is-size-5 subtitle has-text-grey-light'>Dauer: 20 Min. + 30 Min. Wartezeit</h3>
                    </div>

                    <div className='box' id='Material'>
                        <h3 className='is-size-4 title has-text-info'>Material</h3>
                        <div className='is-flex is-flex-direction-column'>
                            <label className='mx-5'>Reagenzgläser</label>
                            <label className='mx-5'>Reagenzglasständer</label>
                            <label className='mx-5'>Einwegpipetten</label>
                        </div>
                    </div>

                    <div className='box mb-7 pb-7' id='Chemikalien'>

                        <h3 className='is-size-4 title has-text-info'>Chemikalien</h3>

                        <div className='mx-5'>
                            <div className='columns is-align-items-center'>
                                <label className='column'>Aceton</label>
                                <figure className='column is-flex is-flex-direction-row'>
                                    <img className='image is-48x48' src={flame} />
                                    <img className='image is-48x48' src={exclamation} />
                                </figure>
                                <strong className='column'>Gefahr</strong>
                                <div className='column'></div>
                            </div>
                            <div className='is-align-items-center'>
                                <label>4 verschiedene Kunststoffgranulate</label>
                            </div>
                        </div>
                    </div>

                    <div className='box' id='Durchführung'>
                        <h3 className='is-size-4 title has-text-info'>Durchführung</h3>

                        <p className='box has-background-danger-light'>
                            <span className='tag is-danger has-text-weight-bold is-medium'>Sicherheit:</span>

                            <div>
                                <label>Schutzbrille tragen!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>

                            <div>
                                <label>Unter dem Abzug arbeiten!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>
                        </p>

                        <div className='box'>
                            <span className='has-text-weight-bold'>1. </span>
                            Beschrifte vier Reagenzgläser mit 1 bis 4 und gib in jedes Reagenzglas 2 ml Aceton sowie drei Stückchen des entsprechenden Kunststoffgranulats.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>2. </span>
                            Schüttle die Proben und lass die Reagenzgläser 30 Minuten stehen. Schüttle erneut und beobachte.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>3. </span>
                            Notiere deine Beobachtung in der Tabelle und vergleiche deine Ergebnisse mit den Literaturangaben.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>

                        <div className='box has-background-info-light'>
                            <span className='tag is-info has-text-weight-bold is-medium'>Entsorgung: </span><br/>
                            Sammle das Aceton in dem bereitgestellten Behälter für organische Lösungsmittelabfälle im Abzug. Spüle die Reagenzgläser mit Flusswasser aus und stelle sie in den bereitgestellten Spülkorb mit der Öffnung nach oben.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                    </div>

                    <div className='box'>
                        <p className="title has-text-info is-4">Löslichkeit verschiedener Kunststoffe</p>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>In Wasser</th>
                                    <th>In Aceton</th>
                                    <th>In Ameisensäure</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>PVAL</td>
                                    <td>PS</td>
                                    <td>PA, PVAL</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="box">
                        <p className="title has-text-info is-4">Mögliche Gefahren</p>

                        <table className="table is-bordered">
                            <tbody>
                                <tr>
                                    <div className="columns">
                                        <td className="column is-3">
                                            <p className="block">Aceton</p>
                                            <figure className="is-flex is-flex-direction-row block">
                                                <img className="image is-64x64" src={flame}></img>
                                                <img className="image is-64x64" src={exclamation}></img>
                                            </figure>
                                            <strong className="block">Gefahr</strong>
                                        </td>
                                        <td className="column is-9">
                                            <p className="block">Gefahrenhinweise</p>
                                            <div className="columns block is-multiline pb-3">
                                                <span className="column py-1 is-2">H225</span>
                                                <span className="column py-1 is-10">Flüssigkeit und Dampf leicht entzündbar.</span>
                                                <span className="column py-1 is-2">H319</span>
                                                <span className="column py-1 is-10">Verursacht schwere Augenreizung.</span>
                                                <span className="column py-1 is-2">H336</span>
                                                <span className="column py-1 is-10">Kann Schläfrigkeit und Benommenheit verursachen.</span>
                                                <span className="column py-1 is-2">EUH066</span>
                                                <span className="column py-1 is-10">Wiederholter Kontakt kann zu spröder oder rissiger Haut führen.</span>
                                            </div>
                                        </td>
                                    </div>
                                </tr>
                            </tbody>
                        </table>

                    </div>

                </div>

            </div>
        </div>
    );
}

export function ExperimentScriptB2 () {
    return (
        <div className='section' id='page-content'>
            <div className='columns'>

                <div className='column is-flexible'>

                    <div className='box mb-7 pb-7'>
                        <h3 className='is-size-2 title has-text-info'>B.2. Bestimmung der Dichte von Kunststoffen</h3>
                        <h3 className='is-size-5 subtitle has-text-grey-light'>Dauer: 30 Min.</h3>
                    </div>

                    <div className='box' id='Material'>
                        <h3 className='is-size-4 title has-text-info'>Material</h3>
                        <div className='is-flex is-flex-direction-column'>
                            <label className='mx-5'>Reagenzgläser</label>
                            <label className='mx-5'>Reagenzglasständer</label>
                            <label className='mx-5'>Becherglas 50 ml</label>
                            <label className='mx-5'>Einwegpipetten</label>
                        </div>
                    </div>

                    <div className='box mb-7 pb-7' id='Chemikalien'>

                        <h3 className='is-size-4 title has-text-info'>Chemikalien</h3>

                        <div className='mx-5'>
                            <div className='is-align-items-center'>
                                <label>4 verschiedene Kunststoffgranulate</label>
                            </div>
                            <div className='is-align-items-center'>
                                <label>VE-Wasser</label>
                            </div>
                            <div className='is-align-items-center'>
                                <label>Natriumchloridlösung gesättigt</label>
                            </div>
                            <div className='is-align-items-center'>
                                <label>Natriumchloridlösung 20%ig</label>
                            </div>
                            <div className='columns is-align-items-center'>
                                <label className='column is-one-third'>Ethanol/Wasser 75% (w/w)</label>
                                <figure className='column is-flex is-flex-direction-row'>
                                    <img className='image is-48x48' src={flame} />
                                    <img className='image is-48x48' src={exclamation} />
                                </figure>
                                <strong className='column'>Gefahr</strong>
                                <div className='column'></div>
                            </div>
                        </div>
                    </div>

                    <div className='box' id='Durchführung'>
                        <h3 className='is-size-4 title has-text-info'>Durchführung</h3>

                        <p className='box has-background-danger-light'>
                            <span className='tag is-danger has-text-weight-bold is-medium'>Sicherheit:</span>

                            <div>
                                <label>Schutzbrille tragen!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>

                            <div>
                                <label>Unter dem Abzug arbeiten!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>
                        </p>

                        <div className='box'>
                            <span className='has-text-weight-bold'>1. </span>
                            Beschrifte vier Reagenzgläser mit 1 bis 4 und gib<br/><br/>
                            in Reagenzglas 1:     5 ml Ethanol/Wasser 75%<br/>
                            in Reagenzglas 2:     5 ml VE-Wasser<br/>
                            in Reagenzglas 3:     5 ml Natriumchloridlösung 20%ig<br/>
                            in Reagenzglas 4:     5 ml Natriumchloridlösung gesättigt
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>2. </span>
                            Bestimme nacheinander die Dichte der vier Kunststoff-granulate:<br/><br/>
                            Gib hierfür jeweils zwei Stückchen des zu untersuchenden Kunststoffgranulats in die Reagenzgläser 1 bis 4. Schüttle die Reagenzgläser und notiere, ob das Granulat schwimmt, schwebt oder sinkt.<br/><br/>
                            Schätze die Dichte des Kunststoffgranulats ab, indem du die Dichtewerte der eingesetzten Lösungen zu Hilfe nimmst. Notiere deine Ergebnisse in der Tabelle.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>

                        <div className='box has-background-info-light'>
                            <span className='tag is-info has-text-weight-bold is-medium'>Entsorgung: </span><br/>
                            Gieße die Inhalte der Reagenzgläser durch ein Sieb und gib die Kunststoffproben in den Behälter für Feststoffabfälle. Alle wässrigen Lösungen kannst du über die Spüle entsorgen, da eine Kläranlage nachgeschaltet ist. Spüle die Reagenzgläser mit Flusswasser aus und stelle sie in den bereitgestellten Spülkorb mit der Öffnung nach oben.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                    </div>

                    <div className="box">
                        <p className="title has-text-info is-4">Dichte verschiedener Kunststoffe</p>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Dichte [g/ml]</th>
                                    <th>Kurzbezeichnung</th>
                                    <th>Kunststoff</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>0,93 - 0,98</td>
                                    <td>PE</td>
                                    <td>Polyethylen</td>
                                </tr>
                                <tr>
                                    <td>1,04 - 1,08</td>
                                    <td>PS</td>
                                    <td>Polystyrol</td>
                                </tr>
                                <tr>
                                    <td>1,12 - 1,15</td>
                                    <td>PA</td>
                                    <td>Polyamid</td>
                                </tr>
                                <tr>
                                    <td>1,16 - 1,20</td>
                                    <td>PMMA</td>
                                    <td>Polymethylmethacrylat</td>
                                </tr>
                                <tr>
                                    <td>1,21 - 1,31</td>
                                    <td>PVAL</td>
                                    <td>Polyvinylalkohol</td>
                                </tr>
                                <tr>
                                    <td>1,38 - 1,41</td>
                                    <td>PVC</td>
                                    <td>Polyvinylchlorid</td>
                                </tr>
                                <tr>
                                    <td>1,38 - 1,41</td>
                                    <td>PET</td>
                                    <td>Polyethylenterephthalat</td>
                                </tr>
                                <tr>
                                    <td>1,18 - 1,20</td>
                                    <td>PAN</td>
                                    <td>Polyacrylnitril</td>
                                </tr>
                                <tr>
                                    <td>2,16 - 2,18</td>
                                    <td>PTFE</td>
                                    <td>Polytetraflourethylen</td>
                                </tr>
                                <tr>
                                    <td>0,90 - 0,95</td>
                                    <td>PP</td>
                                    <td>Polypropylen</td>
                                </tr>
                                <tr>
                                    <td>0,89 - 0,91</td>
                                    <td>PB</td>
                                    <td>Polybutylen</td>
                                </tr>
                                <tr>
                                    <td>1,18 - 1,21</td>
                                    <td>PC</td>
                                    <td>Polycarbonat</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="box">
                        <p className="title has-text-info is-4">Mögliche Gefahren</p>

                        <table className="table is-bordered">
                            <tbody>
                                <tr className="columns">
                                    <td className="column is-3">
                                        <p className="block">Ethanol/Wasser 75% (w/w)</p>
                                        <figure className="is-flex is-flex-direction-row block">
                                            <img className="image is-64x64" src={flame}></img>
                                            <img className="image is-64x64" src={exclamation}></img>
                                        </figure>
                                        <strong className="block">Gefahr</strong>
                                    </td>
                                    <td className="column is-9">
                                        <p className="block">Gefahrenhinweise</p>
                                        <div className="columns block is-multiline pb-3">
                                            <span className="column py-1 is-2">H225</span>
                                            <span className="column py-1 is-10">Flüssigkeit und Dampf leicht entzündbar.</span>
                                            <span className="column py-1 is-2">H319</span>
                                            <span className="column py-1 is-10">Verursacht schwere Augenreizung.</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </div>

                </div>

            </div>
        </div>
    );
}

export function ExperimentScriptB3 () {
    return (
        <div className='section' id='page-content'>
            <div className='columns'>

                <div className='column is-flexible'>

                    <div className='box mb-7 pb-7'>
                        <h3 className='is-size-2 title has-text-info'>B.3. Brennverhalten unbekannter Kunststoffe</h3>
                        <h3 className='is-size-5 subtitle has-text-grey-light'>Dauer: 15 Min.</h3>
                    </div>

                    <div className='box' id='Material'>
                        <h3 className='is-size-4 title has-text-info'>Material</h3>
                        <div className='is-flex is-flex-direction-column'>
                            <label className='mx-5'>Kartuschenbrenner</label>
                            <label className='mx-5'>Alufolie</label>
                            <label className='mx-5'>Becherglas 100 ml</label>
                            <label className='mx-5'>Magnesiarinne</label>
                            <label className='mx-5'>Holzklammer</label>
                        </div>
                    </div>

                    <div className='box mb-7 pb-7' id='Chemikalien'>

                        <h3 className='is-size-4 title has-text-info'>Chemikalien</h3>

                        <div className='mx-5'>
                            <div className='is-align-items-center'>
                                <label>Wasser</label>
                            </div>
                            <div className='is-align-items-center'>
                                <label>4 verschiedene Kunststoffgranulate</label>
                            </div>
                        </div>
                    </div>

                    <div className='box' id='Durchführung'>
                        <h3 className='is-size-4 title has-text-info'>Durchführung</h3>

                        <p className='box has-background-danger-light'>
                            <span className='tag is-danger has-text-weight-bold is-medium'>Sicherheit:</span>

                            <div>
                                <label>Schutzbrille tragen!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>

                            <div>
                                <label>Unter dem Abzug arbeiten!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>
                        </p>

                        <div className='box'>
                            <span className='has-text-weight-bold'>1. </span>
                            Verwende Alufolie als Schutzunterlage für den Tisch. Stelle das Becherglas mit Wasser auf der Folie bereit.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>2. </span>
                            Lege zwei Stückchen des zu untersuchenden Kunststoffgranulats auf eine Magnesiarinne und halte diese mit Hilfe einer Reagenzglasklammer in die Flamme des Kartuschenbrenners. <span className='has-text-danger'>Arbeite hinter der Abzugsscheibe und achte darauf, dass nichts auf den Brenner tropft.</span>
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>3. </span>
                            Prüfe genau, ob die Probe in der Flamme und außerhalb der Flamme brennt, und beobachte die Flammenfärbung sowie die Rußentwicklung. Trage die Ergebnisse deiner Beobachtungen in die Tabelle ein.<br/>
                            <span className='has-text-danger'>Beachte, dass Geruchsproben verboten sind!</span>
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>4. </span>
                            Tauche die Magnesiarinne zum Erkalten in ein kleines Becherglas mit kaltem Wasser. Brich das verbrauchte Stück danach vorsichtig ab und gib es in den Tischabfallbehälter. Verwende die Rinne dann wieder.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>5. </span>
                            Vergleiche die Werte mit den Literaturdaten und bestimme den Kunststoff.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>

                        <div className='box has-background-info-light'>
                            <span className='tag is-info has-text-weight-bold is-medium'>Info: </span><br/>
                            Farbstoffe, Füllstoffe und Weichmacher können die Ergebnisse verfälschen.
                        </div>
                    </div>

                    <div className="box">
                        <p className="title has-text-info is-4">Brennverhalten verschiedener Kunststoffe</p>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th>Brennbarkeit</th>
                                    <th>Flamme</th>
                                    <th>Kunststoff</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>nicht brennbar</td>
                                    <td></td>
                                    <td>PTFE</td>
                                </tr>
                                <tr>
                                    <td>schwer entzündbar,<br/>erlischt außerhalb der Flamme</td>
                                    <td>grüner Saum</td>
                                    <td>PVC</td>
                                </tr>
                                <tr>
                                    <td>brennt in der Flamme,<br/>erlischt außerhalb</td>
                                    <td>leuchtend, rußend, gelb- grauer Rauch<br/>
                                    gelborange blauer Rauch</td>
                                    <td>PC<br/>
                                    PA</td>
                                </tr>
                                <tr>
                                    <td>brennt in der Flamme,<br/>
                                    erlischt außerhalb langsam oder nicht</td>
                                    <td>leuchtend, Zersetzung<br/>
                                    gelborange, rußend<br/>
                                    gelb, blauer Kern</td>
                                    <td>PVAL<br/>
                                    PET<br/>
                                    PE, PP, PB</td>
                                </tr>
                                <tr>
                                    <td>leicht entzündbar,<br/>brennt außerhalb der Flamme weiter</td>
                                    <td>leuchtend, sehr stark rußend, leuchtend blauer Kern, knisternd</td>
                                    <td>PS, PMMA, PAN</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        </div>
    );
}

export function ExperimentScriptB4 () {
    return (
        <div className='section' id='page-content'>
            <div className='columns'>

                <div className='column is-flexible'>

                    <div className='box mb-7 pb-7'>
                        <h3 className='is-size-2 title has-text-info'>B.4. Pyrolyse unbekannter Kunststoffe</h3>
                        <h3 className='is-size-5 subtitle has-text-grey-light'>Dauer: 15 Min.</h3>
                    </div>

                    <div className='box' id='Material'>
                        <h3 className='is-size-4 title has-text-info'>Material</h3>
                        <div className='is-flex is-flex-direction-column'>
                            <label className='mx-5'>Reagenzgläser</label>
                            <label className='mx-5'>Reagenzglasständer</label>
                            <label className='mx-5'>Holzklammer</label>
                            <label className='mx-5'>Kartuschenbrenner</label>
                            <label className='mx-5'>pH-Indikatorpapier</label>
                        </div>
                    </div>

                    <div className='box mb-7 pb-7' id='Chemikalien'>

                        <h3 className='is-size-4 title has-text-info'>Chemikalien</h3>

                        <div className='mx-5'>
                            <div className='is-align-items-center'>
                                <label>4 verschiedene Kunststoffgranulate</label>
                            </div>
                            <div className='is-align-items-center'>
                                <label>VE-Wasser</label>
                            </div>
                        </div>
                    </div>

                    <div className='box' id='Durchführung'>
                        <h3 className='is-size-4 title has-text-info'>Durchführung</h3>

                        <p className='box has-background-danger-light'>
                            <span className='tag is-danger has-text-weight-bold is-medium'>Sicherheit:</span>

                            <div>
                                <label>Schutzbrille tragen!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>

                            <div>
                                <label>Unter dem Abzug arbeiten!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>
                        </p>

                        <div className='box'>
                            <span className='has-text-weight-bold'>1. </span>
                            Gib zwei bis drei Stückchen des zu untersuchenden Kunststoffgranulats in ein Reagenzglas.<br/>
                            Hänge einen am Rand umgeknickten und mit VE-Wasser angefeuchteten Streifen pH-Papier in das Reagenzglas.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>2. </span>
                            Halte das Reagenzglas mit der Holzklammer in die Flamme des Kartuschenbrenners. <span className='has-text-danger'>Arbeite hinter der Abzugsscheibe und achte darauf, dass die Öffnung des Reagenzglases von anderen Personen weg nach hinten in den Abzug weist!</span>
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>3. </span>
                            Beobachte, ob sich die Farbe des pH-Papiers ändert.<br/>
                            Notiere deine Beobachtungen in der Tabelle.<br/>
                            <span className='has-text-danger'>Beachte, dass Geruchsproben verboten sind!</span>
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>

                        <div className='box has-background-info-light'>
                            <span className='tag is-info has-text-weight-bold is-medium'>Entsorgung: </span><br/>
                            Entsorge die <span className='has-text-danger'>abgekühlten (!)</span> Reagenzgläser mit den Pyrolyseprodukten in den Tischabfallbehälter im Abzug.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                    </div>

                    <div className="box">
                        <p className='title has-text-info is-5'>Reaktion der Pyrolysegase mit pH-Papier</p>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th>pH 0,5 bis pH 2  </th>
                                    <th>pH 3 bis pH 7  </th>
                                    <th>pH 8 bis pH 9,5  </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>PVC, PTFE</td>
                                    <td>PE, PP, PB, PS,<br/>PMMA, PC, PVAL, PET</td>
                                    <td>PA, PAN</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

export function ExperimentScriptB5 () {
    return (
        <div className='section' id='page-content'>
            <div className='columns'>

                <div className='column is-flexible'>

                    <div className='box mb-7 pb-7'>
                        <h3 className='is-size-2 title has-text-info'>B.5. Schmelzspinnen – Fäden aus Polyamid</h3>
                        <h3 className='is-size-5 subtitle has-text-grey-light'>Dauer: 10 Min.</h3>
                    </div>

                    <div className='box' id='Material'>
                        <h3 className='is-size-4 title has-text-info'>Material</h3>
                        <div className='is-flex is-flex-direction-column'>
                            <label className='mx-5'>Reagenzgläser</label>
                            <label className='mx-5'>Reagenzglasständer</label>
                            <label className='mx-5'>Holzklammer</label>
                            <label className='mx-5'>Kartuschenbrenner</label>
                            <label className='mx-5'>Holzstab</label>
                        </div>
                    </div>

                    <div className='box mb-7 pb-7' id='Chemikalien'>

                        <h3 className='is-size-4 title has-text-info'>Chemikalien</h3>

                        <div className='mx-5'>
                            <div className='is-align-items-center'>
                                <label>Polyamid-Granulat</label>
                            </div>
                        </div>
                    </div>

                    <div className='box' id='Durchführung'>
                        <h3 className='is-size-4 title has-text-info'>Durchführung</h3>

                        <p className='box has-background-danger-light'>
                            <span className='tag is-danger has-text-weight-bold is-medium'>Sicherheit:</span>

                            <div>
                                <label>Schutzbrille tragen!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>

                            <div>
                                <label>Unter dem Abzug arbeiten!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>
                        </p>

                        <div className='box'>
                            <span className='has-text-weight-bold'>1. </span>
                            Gib eine Spatelspitze Polyamid-Granulat in ein Reagenzglas. Halte das Reagenzglas mit der Holzklammer und schmelze das Granulat vorsichtig über der Brennerflamme.
                            <span className='has-text-danger'> Beachte, dass du hinter der Abzugsscheibe arbeitest und die Öffnung des Reagenzglases von anderen Personen weg nach hinten in den Abzug weist! </span>
                            <strong>Achte darauf, dass die Schmelze nicht braun wird.</strong>
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>2. </span>
                            Nimm die Schmelze aus der Brennerflamme und schalte den Brenner aus.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>3. </span>
                            Mit einem in die Schmelze getauchten Holzstab kannst du nun zahlreiche seidenglänzende Fäden ziehen. Die Fäden kannst du noch verstrecken.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>

                        <div className='box has-background-info-light'>
                            <span className='tag is-info has-text-weight-bold is-medium'>Entsorgung: </span><br/>
                            Entsorge das <span className='has-text-danger'>abgekühlte (!)</span> Reagenzglas in den Tischabfallbehälter im Abzug.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export function ExperimentScriptB6 () {
    return (
        <div className='section' id='page-content'>
            <div className='columns'>

                <div className='column is-flexible'>

                    <div className='box mb-7 pb-7'>
                        <h3 className='is-size-2 title has-text-info'>B.6. Verstrecken eines Kunststofffadens</h3>
                        <h3 className='is-size-5 subtitle has-text-grey-light'>Dauer: 5 Min.</h3>
                    </div>

                    <div className='box' id='Material'>
                        <h3 className='is-size-4 title has-text-info'>Material</h3>
                        <div className='is-flex is-flex-direction-column'>
                            <label className='mx-5'>Unverstreckter Kunstrasen</label>
                            <label className='mx-5'>Faden aus unverstrecktem Polyamid</label>
                        </div>
                    </div>

                    <div className='box' id='Durchführung'>
                        <h3 className='is-size-4 title has-text-info'>Durchführung</h3>

                        <p className='box has-background-danger-light'>
                            <span className='tag is-danger has-text-weight-bold is-medium'>Sicherheit:</span>

                            <div>
                                <label>Schutzbrille tragen!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>
                        </p>

                        <div className='box'>
                            Ziehe den jeweiligen Faden gleichmäßig kräftig auseinander.<br/><br/>
                            Um welchen Faktor wird der Faden länger?<br/>
                            Was kannst du noch beobachten?
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>

                        <div className='box has-background-info-light'>
                            <span className='tag is-info has-text-weight-bold is-medium'>Entsorgung: </span><br/>
                            Wirf die verstreckten Fäden in den Tischabfallbehälter.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export function ExperimentScriptC1 () {
    return (
        <div className='section' id='page-content'>
            <div className='columns'>

                <div className='column is-flexible'>

                    <div className='box mb-7 pb-7'>
                        <h3 className='is-size-2 title has-text-info'>C.1. Funktionsweise von Superabsorbern</h3>
                        <h3 className='is-size-5 subtitle has-text-grey-light'>Dauer: 15 Min.</h3>
                    </div>

                    <div className='box mb-7 pb-7' id='Material'>
                        <h3 className='is-size-4 title has-text-info'>Material</h3>
                        <div className='is-flex is-flex-direction-column'>
                            <label className='mx-5'>3 Bechergläser 250 ml</label>
                            <label className='mx-5'>Becherglas 50 ml</label>
                            <label className='mx-5'>Glasstab</label>
                            <label className='mx-5'>Spatellöffel</label>
                        </div>
                    </div>

                    <div className='box mb-7 pb-7' id='Chemikalien'>

                        <h3 className='is-size-4 title has-text-info'>Chemikalien</h3>

                        <div className='mx-5'>
                            <div className='is-align-items-center'>
                                <label>Superabsorber Hysorb</label>
                            </div>
                            <div className='is-align-items-center'>
                                <label>Trink- bzw. Betriebswasser</label>
                            </div>
                            <div className='is-align-items-center'>
                                <label>VE-Wasser</label>
                            </div>
                            <div className='is-align-items-center'>
                                <label>Natriumchlorid</label>
                            </div>
                        </div>
                    </div>

                    <div className='box' id='Durchführung'>
                        <h3 className='is-size-4 title has-text-info'>Durchführung</h3>

                        <p className='box has-background-danger-light'>
                            <span className='tag is-danger has-text-weight-bold is-medium'>Sicherheit:</span>

                            <div>
                                <label>Schutzbrille tragen!</label>
                                <label className='checkbox is-pulled-right is-vcentered'>
                                    <input type='checkbox' />
                                </label>
                            </div>
                        </p>

                        <div className='box'>
                            <span className='has-text-weight-bold'>1. </span>
                            Stelle 150 ml einer 0,9%igen Natriumchloridlösung her.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>2. </span>
                            Beschrifte die 250-ml-Bechergläser mit 1 bis 3 und gib<br/><br/>
                            in Becherglas 1:     150 ml Trinkwasser<br/>
                            in Becherglas 2:     150 ml VE-Wasser<br/>
                            in Becherglas 3:     150 ml 0,9%ige Natriumchloridlösung.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                        <div className='box'>
                            <span className='has-text-weight-bold'>3. </span>
                            Gib je 1 g Superabsorber in die Bechergläser 1 bis 3 und rühre mit dem Glasstab um. Beobachte genau, was passiert.
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>

                        <div className='box has-background-info-light'>
                            <span className='tag is-info has-text-weight-bold is-medium'>Entsorgung: </span><br/>
                            Schütte die Inhalte der Bechergläser in ein Sieb. Entsorge den Superabsorber in den Behälter für Feststoffabfälle (Hobbock) und <span className='has-text-weight-bold'><u>auf keinen Fall</u> in den Abguss (Verstopfungsgefahr)!</span>
                            <label className='checkbox is-pulled-right is-vcentered'>
                                <input type='checkbox' />
                            </label>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
