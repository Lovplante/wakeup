
// also ldog packt hier der merged buffer rein, heisst find heraus wo der den macht//recorded



export function bufferToWav(buffer) {
    let numChannels = buffer.numberOfChannels;
    let numSamples = buffer.length;
    let sampleRate = buffer.sampleRate;
    // 16 bit bedeutet 2 byte pro sample
    let bytesPerSample = 2;
    // so viele bytes braucht ein sample frame ueber alle kanaele
    let blockAlign = numChannels * bytesPerSample;
    // so viele Bytes brauchen alle daten zusammen
    let dataSize = numSamples * numChannels * bytesPerSample;
    // Wav datei hat 44byte heade plus den datenberech (FIND RAUS WAS DAS BEDEUTET)
    let fileSize = 44 + dataSize;
    // speicher anlegen fuer die datei
    let arrayBuffer = new ArrayBuffer(fileSize);
    // hiermit kannst du bytes in den predetermined array schreiben
    let view = new DataView(arrayBuffer);
    // schreibperson. 0 halt anfang vom buffer
    let pos = 0;

    //  hilfsfunktion schreibt text wie RIFF oder WAVE als bytes (WAS DAS)
    // okay kein plan was hier abgeht, ich vermute der incremented jedes byte und schreibt dann daten rein aber check das mal alex
    function writeString(s) {
        for (let i = 0; i < s.length; i++) {
            view.setUint8(pos, s.charCodeAt(i));
            pos++;
        }
    }

    // 32 Bit ganzzahl schreiben (whatever ja klar machen wa)
    function writeUint32(value) {
        view.setUint32(pos, value, true);
        pos += 4;
    }

    //  16 bit ganzzahl schreiben
    function writeUint16(value) {
        view.setUint16(pos, value, true);
        pos += 2;
    }

    // jetzt den header der wav datei schreiben (so wie ich verstanden hab die metadata fuer den buffer)

    writeString("RIFF");        //kennung fuer dieses dateiformat
    writeUint32(fileSize - 8);  //dateigroesse minus RIFF und diese zahl ja welche ist denn diese warum minus 8 wtfish
    writeString("WAVE");        //dateiart ist wav

    writeString("fmt ");        //format block startet(leerzeichen wichtig??)
    // ja id raffe nichts mehr
    writeUint32(16);                     // Größe des Format Blocks
    writeUint16(1);                      // 1 steht für unkomprimiertes Audio
    writeUint16(numChannels);            // Anzahl Kanäle
    writeUint32(sampleRate);            // Sample Rate
    writeUint32(sampleRate * blockAlign); // Bytes pro Sekunde
    writeUint16(blockAlign);            // Block Größe
    writeUint16(16);                     // Bits pro Sample

    writeString("data");                 // Daten Block startet
    writeUint32(dataSize);               // Größe des Datenbereichs


    // jetzt werden samples geschrieben

    // Für jeden Kanal holen wir uns das Float Array der Samples
  let channelData = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  // Alle Sample Frames durchlaufen
  for (let i = 0; i < numSamples; i++) {
    // Für jeden Kanal das Sample an dieser Position schreiben
    for (let ch = 0; ch < numChannels; ch++) {
      // Float Sample zwischen -1 und +1
      let sample = channelData[ch][i];

      // Zur Sicherheit begrenzen, falls etwas drüber ist
      if (sample < -1) sample = -1;
      if (sample > 1) sample = 1;

      // Float Wert in eine 16 Bit Ganzzahl umrechnen
      if (sample < 0) {
        sample = sample * 0x8000;    // negative Seite
      } else {
        sample = sample * 0x7FFF;    // positive Seite
      }

      // Diese 16 Bit Zahl in den Buffer schreiben
      view.setInt16(pos, sample, true);
      pos += 2;
    }
  }

  // Aus dem fertigen Speicher einen Blob mit Typ audio/wav machen
  let wavBlob = new Blob([arrayBuffer], { type: "audio/wav" });

  // Diesen Blob geben wir zurück
  return wavBlob;
}