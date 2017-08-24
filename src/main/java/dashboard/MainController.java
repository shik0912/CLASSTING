package dashboard;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/*
에러가난다.
@Controller
public class MainController {


    @RequestMapping(value="/",method = RequestMethod.GET)
    public String homepage(){
        return "index";
    }
}
*/

@RestController
public class MainController {


    @RequestMapping("/")
    public String index() {
        return "Greetings from Spring Boot!";
    }
}