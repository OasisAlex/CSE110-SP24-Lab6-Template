describe('Basic note taking app feature testing', () => {
    //First visit the note website
    beforeAll(async () => {
        await page.goto('http://127.0.0.1:5500/index.html');
    });

    //Check creat note
    it('Initial Note - Check for note successfully created', async () => {
        console.log('create the note and check');
        const addNote = await page.$('.add-note');
        await addNote.click();
        const numNotes = await page.$$eval('.note', (noteitems) => {
            return noteitems.length;
        } );
        expect(numNotes).toBe(1);
    });

    //Check edit the note and save
    it('Check edit the note, should have abc in note', async () => {
        console.log('check for element in note');
        const note = await page.$('.note');
        await note.type('abc');
        await page.click('body');
        const noteValue = await page.evaluate(note => note.value, note);
        expect(noteValue).toBe('abc');

    });

    
    it('save by tap', async () => {
        console.log('should edit a new note and save by pressing Tab');
        await page.click('.add-note');
        const note = await page.$$('.note');
        const lastNote = note[note.length - 1];
        await lastNote.type('asd');
        await page.keyboard.press('Tab'); 
        const noteValue = await page.evaluate(note => note.value, lastNote);
        expect(noteValue).toBe('asd');
    });

    it('should edit an existing note and save by clicking outside', async () => {
        console.log('edit the first note and change context to hi');
        const note = await page.$('.note');
        await note.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await note.type('hi');
        await page.click('body');
        const noteValue = await page.evaluate(note => note.value, note);
        expect(noteValue).toBe('hi');
    });

    it('should delete a note on double click', async () => {
        console.log('create a note and delete it');
        await page.click('.add-note');
        const noteHandles = await page.$$('.note');
        const lastNote = noteHandles[noteHandles.length - 1];
        await lastNote.type('This note will be deleted');
        await page.click('body');
        await page.evaluate(note => {
            const clickEvent = new MouseEvent('dblclick', { bubbles: true, cancelable: true });
            note.dispatchEvent(clickEvent);
          }, lastNote);
        const notes = await page.$$('.note');
        expect(notes.length).toBe(2);
    });

    it('should persist notes after refreshing the page', async () => {
        console.log('refresh the page and everything still the same');
        let allSaved = true;
        await page.reload();
        const noteValue = await page.evaluate(() => {
        const notes = document.querySelectorAll('.note');
        return notes[notes.length - 1].value;
        });
        if (noteValue !== 'asd') {allSaved = false};
        const notes = await page.$$('.note');
        if (notes.length !== 2) {allSaved = false};
        expect(allSaved).toBe(true);
    });

    
    it('should delete all notes with ctrl+shift+D', async () => {
        console.log('delet all notes');
        page.on('dialog', async dialog => {
            console.log(dialog.message()); // Log the dialog message (optional)
            await dialog.accept(); // Press OK
          });
        await page.keyboard.down('Control');
        await page.keyboard.down('Shift');
        await page.keyboard.press('KeyD');
        await page.keyboard.up('Shift');
        await page.keyboard.up('Control');

        await page.waitForFunction(() => {
            const notesContainer = document.getElementById('notes-app');
            return notesContainer.querySelectorAll('.note').length === 0;
          });

        const notes = await page.$$('.note');
        expect(notes.length).toBe(0);

    });


    it('should persist notes after refreshing the page', async () => {
        console.log('refresh the page and everything is empty');
        let allSaved = true;
        await page.reload();
        const notes = await page.$$('.note');
        if (notes.length !== 0) {allSaved = false};
        expect(allSaved).toBe(true);
    });




});