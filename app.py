from flask import Flask, render_template, redirect, url_for

app = Flask(__name__)

# Every page of SanketAI has its own template and its own script:
#   page            template                 script
#   Overview        templates/overview.html  static/js/overview.js
#   Learn ISL       templates/learn.html     static/js/learn.js
#   Live Sign Studio templates/translator.html static/js/translator.js
#   Video call      templates/call.html      static/js/call.js
#   Practice        templates/practice.html  static/js/practice.js
#   Progress        templates/progress.html  static/js/progress.js
#   AI Buddy        templates/buddy.html     static/js/buddy.js
#   Settings        templates/settings.html  static/js/settings.js
# base.html holds the shared layout (sidebar, top bar, footer); style.css and
# common.js are shared by all pages.
# This file only connects the pages (routes); nothing else is wired to Flask.


@app.route("/")
def overview():
    return render_template("overview.html", active="overview")


@app.route("/learn")
def learn():
    return render_template("learn.html", active="learn")


@app.route("/translator")
def translator():
    return render_template("translator.html", active="translator")


@app.route("/call")
def call():
    return render_template("call.html", active="call")


@app.route("/practice")
def practice():
    return render_template("practice.html", active="practice")


@app.route("/progress")
def progress():
    return render_template("progress.html", active="progress")

@app.route("/login")
def login():
    return render_template("login.html", active="login")

@app.route("/buddy")
def buddy():
    return render_template("buddy.html", active="buddy")


@app.route("/settings")
def settings():
    return render_template("settings.html", active="settings")


@app.route("/overview")
def overview_alias():
    return redirect(url_for("overview"))

# @app.route("/login")
# def login():
#     return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)
