#!/usr/bin/gjs

imports.gi.versions.Gtk = "3.0";
imports.gi.versions.WebKit2 = "4.1";

const Gtk = imports.gi.Gtk;
const WebKit = imports.gi.WebKit2;
const GLib = imports.gi.GLib;


const Settings = Gtk.Settings.get_default();

if(Settings)
    Settings.gtk_application_prefer_dark_theme = true;



const app = new Gtk.Application({
    application_id:"com.danz.browser"
});



app.connect("activate",()=>{


const win = new Gtk.ApplicationWindow({
    application:app,
    title:"Danz Browser",
    default_width:1280,
    default_height:720
});



const main = new Gtk.Box({
    orientation:Gtk.Orientation.VERTICAL
});



const toolbar = new Gtk.Box({
    orientation:Gtk.Orientation.HORIZONTAL,
    spacing:5,
    margin:5
});



const back = new Gtk.Button({label:"◀"});
const forward = new Gtk.Button({label:"▶"});
const reload = new Gtk.Button({label:"⟳"});
const home = new Gtk.Button({label:"🏠"});
const google = new Gtk.Button({label:"🔍"});
const chatgpt = new Gtk.Button({label:"🤖"});
const addTab = new Gtk.Button({label:"+"});
const closeTab = new Gtk.Button({label:"✕"});


const url = new Gtk.Entry();
url.set_hexpand(true);



const go = new Gtk.Button({
    label:"Go"
});





// ==========================
// PROFILE PER USER
// ==========================

const profile = GLib.build_filenamev([
    GLib.get_home_dir(),
    ".config",
    "DanzBrowser",
    "profile"
]);


const cache = GLib.build_filenamev([
    profile,
    "cache"
]);


GLib.mkdir_with_parents(
    profile,
    755
);


GLib.mkdir_with_parents(
    cache,
    755
);



const manager = new WebKit.WebsiteDataManager({

    base_data_directory: profile,
    base_cache_directory: cache

});



const context = WebKit.WebContext.new_with_website_data_manager(
    manager
);



const cookies = context.get_cookie_manager();



cookies.set_persistent_storage(
    GLib.build_filenamev([
        profile,
        "cookies.sqlite"
    ]),
    WebKit.CookiePersistentStorage.SQLITE
);





// ==========================
// TAB
// ==========================


const tabs = new Gtk.Notebook();

tabs.set_scrollable(true);


let views=[];



function current(){

    return views[tabs.get_current_page()];

}



function createTab(link){


    let view = new WebKit.WebView({
        web_context:context
    });



    view.load_uri(link);



    views.push(view);



    let label = new Gtk.Label({
        label:"New"
    });



    tabs.append_page(
        view,
        label
    );



    tabs.show_all();



    tabs.set_current_page(
        tabs.get_n_pages()-1
    );



    view.connect(
        "notify::title",
        ()=>{

            let title=view.get_title();

            if(title)
                label.set_text(
                    title.substring(0,20)
                );

        }
    );



    view.connect(
        "notify::uri",
        ()=>{

            let uri=view.get_uri();

            if(uri)
                url.set_text(uri);

        }
    );


}



function closeCurrent(){


    let page=tabs.get_current_page();


    if(page>=0){

        tabs.remove_page(page);

        views.splice(page,1);

    }



    if(tabs.get_n_pages()==0)
        createTab(
            "https://google.com"
        );

}




createTab(
    "https://google.com"
);





// ==========================
// BUTTON
// ==========================


back.connect("clicked",()=>{

    let w=current();

    if(w && w.can_go_back())
        w.go_back();

});


forward.connect("clicked",()=>{

    let w=current();

    if(w && w.can_go_forward())
        w.go_forward();

});


reload.connect("clicked",()=>{

    let w=current();

    if(w)
        w.reload();

});


home.connect("clicked",()=>{

    current().load_uri(
        "https://google.com"
    );

});


google.connect("clicked",()=>{

    current().load_uri(
        "https://google.com"
    );

});


chatgpt.connect("clicked",()=>{

    current().load_uri(
        "https://chatgpt.com"
    );

});


addTab.connect("clicked",()=>{

    createTab(
        "https://google.com"
    );

});


closeTab.connect("clicked",()=>{

    closeCurrent();

});


go.connect("clicked",()=>{

    let link=url.get_text();


    if(!link.startsWith("http"))
        link="https://"+link;


    current().load_uri(link);

});



url.connect("activate",()=>{

    go.emit("clicked");

});





toolbar.pack_start(back,false,false,0);
toolbar.pack_start(forward,false,false,0);
toolbar.pack_start(reload,false,false,0);
toolbar.pack_start(home,false,false,0);

toolbar.pack_start(
    google,
    false,
    false,
    0
);

toolbar.pack_start(
    chatgpt,
    false,
    false,
    0
);

toolbar.pack_start(
    url,
    true,
    true,
    0
);

toolbar.pack_start(
    go,
    false,
    false,
    0
);

toolbar.pack_start(
    addTab,
    false,
    false,
    0
);

toolbar.pack_start(
    closeTab,
    false,
    false,
    0
);



main.pack_start(
    toolbar,
    false,
    false,
    0
);


main.pack_start(
    tabs,
    true,
    true,
    0
);



win.add(main);

win.show_all();



});



app.run([]);