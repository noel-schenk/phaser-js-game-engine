import handler from 'serve-handler';
import esbuild from 'esbuild';
import express from 'express';

const app = express()
const PORT = 7000;

esbuild.build({
    entryPoints: ['./src/App.ts'],
    watch: true,
    outdir: './www/',
    bundle: true
})

app.use(express.static('assets'));

app.get('*', (request, response) => {
    handler(request, response, {
        public: './www/'
    })
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));


