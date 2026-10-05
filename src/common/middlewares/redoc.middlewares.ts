import redoc  from 'redoc-express';

export const setupRedoc = (app: any)=> {
    const redoc_options = {
        title: 'Library',
        specUrl: 'doc.yml',
    };

    app.use('/docs', redoc(redoc_options));

    app.use('/doc.yml', (req:any, res:any) => {
        res.sendFile(`doc.yml`, { root: '.' });
    });
}