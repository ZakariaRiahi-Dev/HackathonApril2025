export default function Nav() {
    return(
        <>
            <nav>
                <header>
                <img class="logo" src="download.png" alt="logo">
                <ul class="nav_links">
                    <li><a href="/tutor">AI Tutor</a></li>
                    <li><a href="#">Promodoro</a></li>
                    <li><a href="#">About The Project</a></li>
                    <li><a href="#">Goal Tracker</a></li>
                </ul><a class="cta" href="#"><select name="contact" class="cta">
                    <option value="contact">Contact</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="chat">Gitub</option>
                    <option value="video">Devpost</option>
                </select></a></header>
            </nav>
            <section id="AI Tutor">
                <div>
                <input type="text" id="input" class="input" placeholder="Start Chatting for Brilliant Ideas!">
                <button id="send" class="send">Send</button>
                </div>
            </section>
        </>
    )
}