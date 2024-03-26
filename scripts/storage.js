// jshint esversion: 6

function getItem(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.log(error.message);
        const storageErrors = {
            'firefox': 'is null',
            'chrome': 'Cannot read properties of null',
            'edge': 'Failed to read the \'localStorage\' property from \'Window\': Access is denied for this document.'
        };

        let storageErrorOccurred = false;
        for (const storageError of storageErrors) {
            if (error.message.includes(storageError)) {
                storageErrorOccurred = true;
                break;
            }
        }

        if (!storageErrorOccurred) {
            throw error;
        }

        

    }
}
